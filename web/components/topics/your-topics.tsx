import { BookmarkIcon } from '@heroicons/react/outline'
import Link from 'next/link'
import toast from 'react-hot-toast'

import { Group, groupPath } from 'common/group'
import { useAPIGetter } from 'web/hooks/use-api-getter'
import { followTopic } from 'web/lib/firebase/api'
import { unfollowTopic } from 'web/lib/supabase/groups'
import { Button } from '../buttons/button'
import { Col } from '../layout/col'
import { Row } from '../layout/row'
import { useTrendingTopics } from '../search/query-topics'
import { LoadingIndicator } from '../widgets/loading-indicator'
import { linkClass } from '../widgets/site-link'
import { User } from 'common/user'
import { track } from 'web/lib/service/analytics'

export const YourTopicsSection = (props: { user: User }) => {
  const { user } = props
  const { data, refresh } = useAPIGetter('get-followed-groups', {
    userId: user.id,
  })
  const followedGroups = data?.groups ?? []
  const followedGroupIds = new Set(followedGroups.map((g) => g.id))

  const unfollow = async (g: Group) => {
    if (user) {
      track('leave group', { groupSlug: g.slug })

      await toast.promise(unfollowTopic(g.id, user?.id), {
        loading: `Unfollowing ${g.name}...`,
        success: () => {
          return `Unfollowed ${g.name}!`
        },
        error: () => {
          return `Failed to unfollow ${g.name}`
        },
      })
      await refresh()
    }
  }
  const follow = async (g: Group) => {
    track('join group', { groupSlug: g.slug })
    await toast.promise(followTopic({ groupId: g.id }), {
      loading: `Following ${g.name}...`,
      success: () => {
        return `Followed ${g.name}!`
      },
      error: () => {
        return `Failed to follow ${g.name}`
      },
    })
    await refresh()
  }

  const trendingTopics = useTrendingTopics(150, 'home-page-trending-topics')

  const nonFollowedTopics = (trendingTopics ?? []).filter(
    (g) => !followedGroupIds.has(g.id)
  )

  return (
    <Col className="mt-1 justify-between gap-4 px-3">
      <div className="text-ink-800 text-xl">Your followed topics</div>
      <div className="grid w-full grid-cols-2 gap-x-2">
        {data === undefined && <LoadingIndicator />}
        {followedGroups.map((g) => {
          return (
            <Row
              key={g.slug}
              className="w-full max-w-sm items-center justify-between p-1"
            >
              <Link className={linkClass} href={groupPath(g.slug)}>
                <div>{g.name}</div>
              </Link>
              <Button
                size={'xs'}
                color="gray-white"
                className={'group'}
                onClick={(e) => {
                  e.preventDefault()
                  unfollow(g)
                }}
              >
                <Row className="gap-1">
                  <BookmarkIcon
                    className={'h-6 w-6 fill-indigo-500 group-hover:fill-none'}
                  />
                </Row>
              </Button>
            </Row>
          )
        })}
      </div>

      <div className="text-ink-800 mt-4 text-xl">Trending topics</div>
      <div className="grid w-full grid-cols-2 gap-x-2">
        {trendingTopics === undefined && <LoadingIndicator />}
        {nonFollowedTopics.map((g) => {
          return (
            <Row
              key={g.slug}
              className="w-full max-w-sm items-center justify-between p-1"
            >
              <Link className={linkClass} href={groupPath(g.slug)}>
                <div>{g.name}</div>
              </Link>
              <Button
                size={'xs'}
                color="gray-white"
                className={'group'}
                onClick={(e) => {
                  e.preventDefault()
                  follow(g)
                }}
              >
                <Row className="gap-1">
                  <BookmarkIcon
                    className={
                      'h-6 w-6 transition-colors focus:fill-indigo-500 group-hover:fill-indigo-500'
                    }
                  />
                </Row>
              </Button>
            </Row>
          )
        })}
      </div>
    </Col>
  )
}