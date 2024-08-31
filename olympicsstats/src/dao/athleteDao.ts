'use server'

import { createClient } from '@/utils/supabase/server'
import { Tables } from '@/types/supabase'

export async function searchAthletes(input: string): Promise<(Tables<'Athlete'> & { type: 'athlete' })[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('Athlete')
    .select('*')
    .ilike('Athlete_Name', `%${input}%`)
    .limit(10)

  if (error) {
    console.error('Error fetching athletes:', error)
    return []
  }

  return data.map(athlete => ({ ...athlete, type: 'athlete' }))
}