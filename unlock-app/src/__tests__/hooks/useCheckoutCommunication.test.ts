import Postmate from 'postmate'
import { renderHook, act } from '@testing-library/react-hooks'
import {
  useCheckoutCommunication,
  CheckoutEvents,
} from '../../hooks/useCheckoutCommunication'

const mockCookies = {
  set: jest.fn(),
}

jest.mock('universal-cookie', () => {
  return () => mockCookies
})

let emit = jest.fn()
describe('useCheckoutCommunication', () => {
  beforeEach(() => {
    emit = jest.fn()
    jest.spyOn(Postmate, 'Model').mockResolvedValue({ emit })
    mockCookies.set = jest.fn()
  })

  it('emits a userInfo event when emitUserInfo is called', async () => {
    expect.assertions(2)

    const { result, wait } = renderHook(() => useCheckoutCommunication())

    await wait(() => result.current.ready)

    const userInfo = { address: '0xmyaddress' }
    result.current.emitUserInfo(userInfo)

    expect(emit).toHaveBeenCalledWith(CheckoutEvents.userInfo, userInfo)
    expect(mockCookies.set).toHaveBeenCalledWith(
      '__unlockCookie__checkout.userInfo__',
      userInfo
    )
  })

  it('emits a closeModal event when emitCloseModal is called', async () => {
    expect.assertions(2)

    const { result, wait } = renderHook(() => useCheckoutCommunication())

    await wait(() => result.current.ready)

    result.current.emitCloseModal()

    // the `undefined` in this call is an artifact of the buffer
    // implementation, which always calls with a payload even if there
    // isn't one. This has no impact on real code, since only the
    // event name is important in this case.
    expect(emit).toHaveBeenCalledWith(CheckoutEvents.closeModal, undefined)
    expect(mockCookies.set).toHaveBeenCalledWith(
      '__unlockCookie__checkout.closeModal__',
      undefined
    )
  })

  it('emits a transactionInfo event when emitTransactionInfo is called', async () => {
    expect.assertions(2)

    const { result, wait } = renderHook(() => useCheckoutCommunication())

    await wait(() => result.current.ready)

    const transactionInfo = { hash: '0xmyhash', lock: '0xmylock' }
    result.current.emitTransactionInfo(transactionInfo)

    expect(emit).toHaveBeenCalledWith(
      CheckoutEvents.transactionInfo,
      transactionInfo
    )
    expect(mockCookies.set).toHaveBeenCalledWith(
      '__unlockCookie__checkout.transactionInfo__',
      transactionInfo
    )
  })

  it('buffers an arbitrary number of events before the emitter is ready', async () => {
    expect.assertions(4)

    const { result, wait } = renderHook(() => useCheckoutCommunication())

    const userInfo = { address: '0xmyaddress' }
    act(() => result.current.emitUserInfo(userInfo))

    const transactionInfo = { hash: '0xmyhash', lock: '0xmylock' }
    act(() => result.current.emitTransactionInfo(transactionInfo))

    act(() => result.current.emitCloseModal())

    // events have gone into the buffer, but have not been emitted
    expect(emit).not.toHaveBeenCalled()

    await wait(() => result.current.ready)

    // Once the emitter is ready, the buffer is flushed in the order events were received
    expect(emit).toHaveBeenNthCalledWith(1, CheckoutEvents.userInfo, userInfo)

    expect(emit).toHaveBeenNthCalledWith(
      2,
      CheckoutEvents.transactionInfo,
      transactionInfo
    )

    expect(emit).toHaveBeenNthCalledWith(
      3,
      CheckoutEvents.closeModal,
      undefined
    )
  })
})
