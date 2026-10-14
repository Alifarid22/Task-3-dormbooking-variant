import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { roomNumber: '', startDate: '', endDate: '', purpose: '' }

export default function BookingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return

    let cancelled = false

    async function loadBooking() {
      try {
        const { data } = await api.get(`/bookings/${id}`)
        const booking = data.booking || data

        if (!cancelled) {
          setForm({
            roomNumber: booking.roomNumber || '',
            startDate: booking.startDate ? booking.startDate.slice(0, 10) : '',
            endDate: booking.endDate ? booking.endDate.slice(0, 10) : '',
            purpose: booking.purpose || ''
          })
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || 'Failed to load booking')
        }
      }
    }

    loadBooking()

    return () => {
      cancelled = true
    }
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    try {
      if (id) {
        await api.patch(`/bookings/${id}`, form)
      } else {
        await api.post('/bookings', form)
      }

      nav('/bookings')
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to save booking')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">
        {id ? 'Edit' : 'New'} Booking
      </h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm font-medium">
          Room number
          <input
            className="input mt-1 w-full"
            name="roomNumber"
            value={form.roomNumber}
            onChange={onChange}
            required
            placeholder="e.g. B2-104"
          />
        </label>

        <label className="block text-sm font-medium">
          Start date
          <input
            className="input mt-1 w-full"
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={onChange}
            required
          />
        </label>

        <label className="block text-sm font-medium">
          End date
          <input
            className="input mt-1 w-full"
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={onChange}
            required
          />
        </label>

        <label className="block text-sm font-medium">
          Purpose <span className="font-normal text-zinc-500">(optional)</span>
          <textarea
            className="input mt-1 w-full"
            name="purpose"
            value={form.purpose}
            onChange={onChange}
            rows={4}
          />
        </label>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button className="btn" type="submit">
          Save
        </button>
      </form>
    </div>
  )
}