'use client'

import { CartItem } from '@/types'
import api from '@/lib/api'
import { Dispatch, SetStateAction, useState } from 'react'
// import { AxiosError } from 'axios' // この行は削除、またはコメントアウト

// AxiosError の型定義は axios パッケージの型定義に含まれているため、
// 明示的にインポートする必要はありません。
// 必要であれば、以下のように定義することもできますが、通常は不要です。
// import { AxiosError } from 'axios'; // もし axios のバージョンが古くてimportが必要な場合はここを残す

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
      const res = await api.post('/purchase', payload)
      const { total_amount, total_amount_ex_tax } = res.data as PurchaseResponse

      setTotalAmount(total_amount)
      setTotalAmountExTax(total_amount_ex_tax)
      setShowPopup(true)
      setCart([])
    } catch (error: unknown) { // any を unknown に変更
      // エラーが axios のエラーかどうかを判断
      // AxiosError の型ガードを使って、型安全にアクセスする
      if (typeof error === 'object' && error !== null && 'response' in error && 'isAxiosError' in error && (error as any).isAxiosError) {
        // AxiosError の場合
        const axiosError = error as any; // ここで any を使うのは、エラー処理内で一時的に許容
        console.error('購入処理エラー:', axiosError.response?.data || axiosError.message || axiosError);
      } else if (error instanceof Error) { // 通常のJavaScriptエラーの場合
        console.error('購入処理エラー:', error.message);
      } else { // その他の不明なエラーの場合
        console.error('購入処理エラー:', error);
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