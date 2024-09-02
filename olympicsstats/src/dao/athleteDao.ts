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

export async function getAthleteById(id: string): Promise<Tables<'Athlete'> | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('Athlete')
    .select('*')
    .eq('Id', id)
    .single()

  if (error) {
    console.error('Error fetching athlete:', error)
    return null
  }

  return data
}

export async function getAthleteResults(athleteId: string): Promise<(Tables<'Result'> & { 
  OlympicGame: Tables<'OlympicGame'> | null; 
  Sport: Tables<'Sport'> | null; 
  Event: Tables<'Event'> | null 
})[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('Result')
    .select('*, OlympicGame(*), Sport(*), Event(*)')
    .eq('Athlete_Id', athleteId)
    .order('Games_Id', { ascending: true })

  if (error) {
    console.error('Error fetching athlete results:', error)
    return []
  }

  return data
}