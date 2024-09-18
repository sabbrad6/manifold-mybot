import clsx from 'clsx'
import { MIN_CASHOUT_AMOUNT } from 'common/economy'
import {
  CASH_TO_MANA_CONVERSION_RATE,
  CHARITY_FEE,
  SWEEPIES_NAME,
} from 'common/envs/constants'
import { User } from 'common/user'
import Link from 'next/link'
import {
  baseButtonClasses,
  Button,
  buttonClass,
} from 'web/components/buttons/button'
import { Col } from 'web/components/layout/col'
import { Row } from 'web/components/layout/row'
import { getNativePlatform } from 'web/lib/native/is-native'
import { CashoutPagesType } from 'web/pages/redeem'
import { ManaCoin } from 'web/public/custom-components/manaCoin'
import { CoinNumber } from '../widgets/coin-number'
import { formatMoney, formatMoneyUSD, formatSweepies } from 'common/util/format'
import { useState } from 'react'
import { useAPIGetter } from 'web/hooks/use-api-getter'
import { ControlledTabs, UncontrolledTabs } from '../layout/tabs'
import { LoadingIndicator } from '../widgets/loading-indicator'
import { CashoutStatusData } from 'common/gidx/gidx'
import { linkClass } from '../widgets/site-link'
import { PaginationNextPrev } from '../widgets/pagination'
import { DateTimeTooltip } from '../widgets/datetime-tooltip'
import { shortenedFromNow } from 'web/lib/util/shortenedFromNow'
import { Spacer } from '../layout/spacer'

export const CASHOUTS_PER_PAGE = 10

export function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'complete':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 '
    case 'failed':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    default:
      return 'bg-ink-100 text-ink-800 dark:bg-ink-200'
  }
}

export function SelectCashoutOptions(props: {
  user: User
  redeemableCash: number
  setPage: (page: CashoutPagesType) => void
  allDisabled?: boolean
}) {
  const { user, allDisabled } = props

  const [cashoutPage, setCashoutPage] = useState(0)

  const { data: cashouts } = useAPIGetter('get-cashouts', {
    limit: CASHOUTS_PER_PAGE,
    offset: cashoutPage * CASHOUTS_PER_PAGE,
    userId: user.id,
  })

  if (!cashouts || (cashouts.length === 0 && cashoutPage === 0)) {
    return <CashoutOptionsContent {...props} />
  }

  return (
    <Col
      className={clsx('w-full gap-4', allDisabled && 'text-ink-700 opacity-80')}
    >
      <UncontrolledTabs
        tabs={[
          {
            title: 'Redemption Options',
            content: <CashoutOptionsContent {...props} />,
          },
          {
            title: 'Cashout History',
            content: (
              <Col className="w-full overflow-auto">
                <table className="w-full border-collapse select-none">
                  <thead>
                    <tr className="text-ink-600 bg-canvas-50">
                      <th className="px-3 py-2 text-left font-semibold">
                        Amount
                      </th>
                      <th className="px-3 py-2 text-left font-semibold">
                        Status
                      </th>
                      <th className="px-3 py-2 text-left font-semibold">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashouts === undefined ? (
                      <tr>
                        <td colSpan={3} className="p-4 text-center">
                          <LoadingIndicator />
                        </td>
                      </tr>
                    ) : (
                      cashouts?.map((cashout: CashoutStatusData) => {
                        const createdDate = new Date(
                          cashout.txn.createdTime
                        ).getTime()
                        return (
                          <tr
                            key={cashout.txn.id}
                            className="border-canvas-50 border-b"
                          >
                            <td className="px-3 py-2 ">
                              {formatMoneyUSD(
                                cashout.txn.data.payoutInDollars,
                                true
                              )}
                            </td>
                            <td className="whitespace-nowrap px-3 py-2">
                              <span
                                className={`rounded-full px-2 py-1 text-xs ${getStatusColor(
                                  cashout.txn.gidxStatus
                                )}`}
                              >
                                {cashout.txn.gidxStatus}
                              </span>
                            </td>
                            <td className="text-ink-500 whitespace-nowrap px-3 py-2">
                              <DateTimeTooltip time={createdDate}>
                                {shortenedFromNow(createdDate)}
                              </DateTimeTooltip>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
                <Spacer h={4} />
                {(cashoutPage > 0 || cashouts.length == CASHOUTS_PER_PAGE) && (
                  <PaginationNextPrev
                    isStart={cashoutPage === 0}
                    isEnd={cashouts.length < CASHOUTS_PER_PAGE}
                    isLoading={false}
                    isComplete={true}
                    getPrev={() => setCashoutPage(cashoutPage - 1)}
                    getNext={() => setCashoutPage(cashoutPage + 1)}
                  />
                )}
              </Col>
            ),
          },
        ]}
      />
    </Col>
  )
}

function CashoutOptionsContent(props: {
  user: User
  redeemableCash: number
  setPage: (page: CashoutPagesType) => void
  allDisabled?: boolean
}) {
  const { setPage, allDisabled, redeemableCash } = props
  const { isNative, platform } = getNativePlatform()
  const isNativeIOS = isNative && platform === 'ios'

  const noHasMinRedeemableCash = redeemableCash < MIN_CASHOUT_AMOUNT
  const hasNoRedeemableCash = redeemableCash === 0
  return (
    <Col className={clsx('gap-4', allDisabled && 'text-ink-700 opacity-80')}>
      <Col className="bg-canvas-50 w-full gap-4 rounded-lg p-4 pb-1">
        <Row className="gap-4">
          <ManaCoin className={clsx('text-7xl', allDisabled && 'grayscale')} />
          <Col>
            <div className="text-lg font-semibold">Get Mana</div>
            <div className="text-ink-700 text-sm">
              Redeem your {SWEEPIES_NAME} at{' '}
              <b>
                {formatSweepies(1)} {'→'}{' '}
                {formatMoney(CASH_TO_MANA_CONVERSION_RATE)}
              </b>
              , no fees included!
            </div>
          </Col>
        </Row>
        <Col className="gap-0.5">
          <Button
            onClick={() => {
              setPage('custom-mana')
            }}
            size="xs"
            color="violet"
            className="whitespace-nowrap text-xs sm:text-sm"
            disabled={!!allDisabled || hasNoRedeemableCash}
          >
            Redeem for mana
          </Button>
          <Row className="text-ink-500 w-full justify-end gap-1 whitespace-nowrap text-xs sm:text-sm ">
            <CoinNumber
              amount={redeemableCash * CASH_TO_MANA_CONVERSION_RATE}
              className={clsx(
                'font-semibold',
                allDisabled ? '' : 'text-violet-600 dark:text-violet-400'
              )}
              coinClassName={clsx(allDisabled && 'grayscale')}
            />
            mana value
          </Row>
        </Col>
      </Col>
      {!isNativeIOS && (
        <Col className="bg-canvas-50 gap-4 rounded-lg p-4 pb-1">
          <Row className="gap-4">
            <img
              alt="donate"
              src="/images/donate.png"
              height={80}
              width={80}
              className={clsx(allDisabled && 'grayscale')}
            />
            <Col>
              <div className="text-lg font-semibold">Donate to Charity</div>
              <div className="text-ink-700 text-sm">
                Redeem your {SWEEPIES_NAME} as a donation to a charitable cause.
              </div>
            </Col>
          </Row>
          <Col className="gap-0.5">
            <Link
              className={clsx(
                baseButtonClasses,
                buttonClass(
                  'xs',
                  noHasMinRedeemableCash || allDisabled ? 'gray' : 'indigo'
                ),
                'text-xs sm:text-sm',
                noHasMinRedeemableCash || allDisabled ? 'text-white' : ''
              )}
              href="/charity"
            >
              Visit charity page
            </Link>
            <Row className="text-ink-500 w-full justify-between gap-1 whitespace-nowrap text-xs sm:text-sm ">
              <span>
                {noHasMinRedeemableCash && !allDisabled ? (
                  <span className="text-red-600 dark:text-red-400">
                    You need at least{' '}
                    <CoinNumber
                      amount={MIN_CASHOUT_AMOUNT}
                      isInline
                      coinType="sweepies"
                      className="font-semibold text-amber-600 dark:text-amber-400"
                    />{' '}
                    to donate
                  </span>
                ) : null}
              </span>
              <span>
                <span
                  className={clsx(
                    'font-semibold',
                    allDisabled ? '' : 'text-green-600 dark:text-green-500'
                  )}
                >
                  ${redeemableCash.toFixed(2)}
                </span>{' '}
                value
              </span>
            </Row>
          </Col>
        </Col>
      )}

      <Col className="bg-canvas-50 w-full gap-4 rounded-lg p-4 pb-1">
        <Row className=" gap-4">
          <img
            alt="cashout"
            src="/images/cash-icon.png"
            height={80}
            width={80}
            className={clsx(
              'h-[80px] w-[80px] object-contain',
              allDisabled && 'grayscale'
            )}
          />
          <Col>
            <div className="text-lg font-semibold">Redeem for USD</div>
            <div className="text-ink-700 text-sm">
              Redeem your {SWEEPIES_NAME} at{' '}
              <b>
                {formatSweepies(1)} {'→'} {formatMoneyUSD(1)}
              </b>
              , minus a <b>{CHARITY_FEE * 100}% fee</b>.
            </div>
          </Col>
        </Row>
        <Col className="gap-0.5">
          <Button
            className={clsx('text-xs sm:text-sm')}
            onClick={() => {
              setPage('documents')
            }}
            disabled={!!allDisabled || noHasMinRedeemableCash}
          >
            Redeem for USD
          </Button>
          <Row className="text-ink-500 w-full justify-between gap-1 whitespace-nowrap text-xs sm:text-sm ">
            <span>
              {noHasMinRedeemableCash && !allDisabled ? (
                <span className="text-red-600 dark:text-red-400">
                  You need at least{' '}
                  <CoinNumber
                    amount={MIN_CASHOUT_AMOUNT}
                    isInline
                    coinType="sweepies"
                    className="font-semibold text-amber-600 dark:text-amber-400"
                  />{' '}
                  to redeem
                </span>
              ) : null}
            </span>
            <span>
              <span
                className={clsx(
                  'font-semibold',
                  allDisabled ? '' : 'text-green-600 dark:text-green-500'
                )}
              >
                ${((1 - CHARITY_FEE) * redeemableCash).toFixed(2)}
              </span>{' '}
              value
            </span>
          </Row>
        </Col>
      </Col>
    </Col>
  )
}
