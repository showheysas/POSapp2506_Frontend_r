'use client'

import { CartItem } from '@/types'
import api from '@/lib/api'
import { Dispatch, SetStateAction, useState } from 'react'

// AxiosError の型定義を、必要なプロパティだけを持つように定義します。
// これは @typescript-eslint/no-explicit-any を回避しつつ、Axiosのエラー構造にアクセスするためです。
interface AxiosErrorResponse {
  data?: {
    // FastAPIのエラーレスポンスの具体的な構造に合わせて調整してください
    // 例えば、{ detail: string } のような形式かもしれません
    message?: string;
    detail?: string;
    // ...その他、エラーレスポンスに含まれる可能性のあるプロパティ
  };
  status?: number;
  // ...その他、レスポンスオブジェクトに含まれる可能性のあるプロパティ
}

interface CustomAxiosError extends Error {
  isAxiosError?: boolean;
  response?: AxiosErrorResponse;
  config?: any; // configはanyでも問題ないことが多い
  code?: string;
  request?: any;
}


type Props = {
  cart: CartItem[]
  setCart: Dispatch<SetStateAction<CartItem[]>>
}

export default function PurchaseButton({ cart, setCart }: Props) {
  const [showPopup, setShowPopup] = useState(false)
  const [totalAmount, setTotalAmount] = useState(0)
  const [totalAmountExTax, setTotalAmountExTax] = useState(0)

  const handlePurchase = async () => {
    if (cart.length === 0) {
      alert('カートが空です')
      return
    }

    const payload = {
      emp_cd: '9999999999',
      store_cd: '00030',
      pos_no: '090',
      details: cart.map((item) => ({
        prd_code: String(item.code),
        prd_name: item.name,
        prd_price: item.price,
        tax_cd: '01',
      })),
    }

    type PurchaseResponse = {
      total_amount: number
      total_amount_ex_tax: number
    }

    try {
      const res = await api.post<PurchaseResponse>('/purchase', payload)
      const { total_amount, total_amount_ex_tax } = res.data 

      setTotalAmount(total_amount)
      setTotalAmountExTax(total_amount_ex_tax)
      setShowPopup(true)
      setCart([])
    } catch (error: unknown) { // any を unknown に変更
      // エラーが axios のエラーかどうかをより厳密にチェックし、型を定義
      const isAxiosError = (err: unknown): err is CustomAxiosError => {
        return (
          typeof err === 'object' &&
          err !== null &&
          'isAxiosError' in err &&
          (err as CustomAxiosError).isAxiosError === true
        );
      };

      if (isAxiosError(error)) { // 型ガードを使用
        console.error(
          '購入処理エラー (Axios):',
          error.response?.data?.message || error.response?.data?.detail || error.message || error
        );
      } else if (error instanceof Error) { // 通常のJavaScriptエラーの場合
        console.error('購入処理エラー (Generic Error):', error.message);
      } else { // その他の不明なエラーの場合
        console.error('購入処理エラー (Unknown Error):', error);
      }
      alert('購入処理に失敗しました')
    }
  }

  return (
    <>
      <button
        onClick={handlePurchase}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
      >
        購入確定
      </button>

      {showPopup && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <div className="bg-white rounded-2xl shadow-lg p-6 w-11/12 max-w-sm text-center">
            <h2 className="text-lg font-semibold mb-4">購入が完了しました</h2>
            <p className="text-sm">合計（税込）：<span className="font-bold">{totalAmount.toLocaleString()}円</span></p>
            <p className="text-sm mb-6">税抜金額：<span className="font-bold">{totalAmountExTax.toLocaleString()}円</span></p>
            <button
              onClick={() => setShowPopup(false)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  )
}