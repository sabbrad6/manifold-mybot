import { ImageResponse, ImageResponseOptions } from '@vercel/og'
import { NextRequest } from 'next/server'
import { OgWeeklyUpdate } from 'web/components/og/og-weekly-update'
import { WeeklyPortfolioUpdateOGCardProps } from 'common/weekly-portfolio-update'
import { getCardOptions, replaceTw } from 'web/pages/api/og/market'

export const config = { runtime: 'edge' }
export default async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const options = await getCardOptions()
    const ogWeeklyProps = Object.fromEntries(
      searchParams.entries()
    ) as WeeklyPortfolioUpdateOGCardProps
    const image = OgWeeklyUpdate(ogWeeklyProps)

    return new ImageResponse(replaceTw(image), options as ImageResponseOptions)
  } catch (e: any) {
    console.log(`${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
