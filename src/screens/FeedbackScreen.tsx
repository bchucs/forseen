import * as React from 'react'
import { toast } from 'sonner'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { feedbackStats, mocks } from '@/data/mocks'

const pieData = [
  { name: 'Thumbs up', value: feedbackStats.thumbsUpPercent, fill: '#007353' },
  { name: 'Thumbs down', value: feedbackStats.thumbsDownPercent, fill: '#d4d4d4' },
]

export function FeedbackScreen() {
  const [useful, setUseful] = React.useState('useful')
  const [note, setNote] = React.useState('')

  const downloadCsv = () => {
    const rows = [['predictionId', 'topic', 'rating', 'comment', 'useful'], ...mocks.feedback.map((f) => [String(f.predictionId), f.topic, String(f.rating), f.comment, String(f.useful)])]
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'forseen-feedback-demo.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV downloaded (mock export)')
  }

  const submit = () => {
    toast.success('Feedback submitted (demo)')
    setNote('')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-light tracking-tight">Prediction feedback</h1>
        <p className="text-sm text-neutral-500">Demo analytics — no server.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-neutral-200">
          <CardHeader>
            <CardTitle className="text-base">Sentiment split</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={36} outerRadius={52} paddingAngle={2}>
                    {pieData.map((e, i) => (
                      <Cell key={i} fill={e.fill} stroke="none" />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={28} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="border-neutral-200">
          <CardHeader>
            <CardTitle className="text-base">Average rating</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-light tabular-nums">{feedbackStats.avgRating.toFixed(1)}</p>
            <p className="text-sm text-neutral-500">out of 5.0</p>
            <div className="mt-4 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < Math.round(feedbackStats.avgRating) ? 'text-[#007353]' : 'text-neutral-200'}>
                  ★
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle className="text-base">Per-prediction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mocks.feedback.map((f) => (
            <div key={f.predictionId} className="flex flex-col gap-1 border-b border-neutral-100 py-3 last:border-0 last:pb-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-light">{f.topic}</span>
                <span className="text-sm text-neutral-500">{f.rating}/5</span>
              </div>
              <p className="text-sm text-neutral-600">&ldquo;{f.comment}&rdquo;</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle className="text-base">Submit feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="useful">Was this useful?</Label>
            <select
              id="useful"
              className="flex h-11 w-full max-w-xs rounded-2xl border border-neutral-200/80 bg-[color:var(--color-elevated)] px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30"
              value={useful}
              onChange={(e) => setUseful(e.target.value)}
            >
              <option value="useful">Useful</option>
              <option value="accurate">Accurate</option>
              <option value="both">Both</option>
              <option value="neither">Neither</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fb-note">Notes</Label>
            <Textarea id="fb-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What should we improve?" rows={4} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="accent" onClick={submit}>
              Submit
            </Button>
            <Button variant="secondary" type="button" onClick={downloadCsv}>
              Download CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
