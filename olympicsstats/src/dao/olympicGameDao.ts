'use server'

import { createClient } from '@/utils/supabase/server'
import { Tables } from '@/types/supabase'

export async function searchOlympicGames(input: string): Promise<(Tables<'OlympicGame'> & { type: 'olympicGame' })[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('OlympicGame')
    .select('*')
    .ilike('City', `%${input}%`)
    .limit(10)

  if (error) {
    console.error('Error fetching Olympic games:', error)
    return []
  }

  return data.map(game => ({ ...game, type: 'olympicGame' }))
}

export async function getOlympicGameById(id: string): Promise<Tables<'OlympicGame'> | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('OlympicGame')
    .select('*')
    .eq('Id', id)
    .single()

  if (error) {
    console.error('Error fetching Olympic game:', error)
    return null
  }

  return data
}