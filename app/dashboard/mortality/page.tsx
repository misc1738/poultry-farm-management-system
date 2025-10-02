"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { MortalityForm } from "@/components/mortality-form"
import { MortalityList } from "@/components/mortality-list"
import type { Mortality } from "@/lib/types"

export default function MortalityPage() {
  const [records, setRecords] = useState<Mortality[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Mortality | null>(null)

  useEffect(() => {
    loadRecords()
  }, [])

  const loadRecords = () => {
    const stored = localStorage.getItem("mortality")
    if (stored) {
      setRecords(JSON.parse(stored))
    }
  }

  const handleSave = (record: Mortality) => {
    let updatedRecords: Mortality[]
    if (editingRecord) {
      updatedRecords = records.map((r) => (r.id === record.id ? record : r))
    } else {
      updatedRecords = [...records, record]
    }
    localStorage.setItem("mortality", JSON.stringify(updatedRecords))
    setRecords(updatedRecords)
    setShowForm(false)
    setEditingRecord(null)
  }

  const handleEdit = (record: Mortality) => {
    setEditingRecord(record)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    const updatedRecords = records.filter((r) => r.id !== id)
    localStorage.setItem("mortality", JSON.stringify(updatedRecords))
    setRecords(updatedRecords)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingRecord(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mortality Records</h1>
          <p className="text-muted-foreground">Track bird mortality and causes</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Record
          </Button>
        )}
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingRecord ? "Edit Mortality Record" : "New Mortality Record"}</CardTitle>
            <CardDescription>
              {editingRecord ? "Update the mortality record details" : "Record a new mortality incident"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MortalityForm record={editingRecord} onSave={handleSave} onCancel={handleCancel} />
          </CardContent>
        </Card>
      ) : (
        <MortalityList records={records} onEdit={handleEdit} onDelete={handleDelete} />
      )}
    </div>
  )
}
