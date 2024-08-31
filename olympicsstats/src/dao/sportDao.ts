'use server'

import { createClient } from '@/utils/supabase/server'
import { Tables } from '@/types/supabase'

export async function searchSports(input: string): Promise<(Tables<'Sport'> & { type: 'sport' })[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('Sport')
    .select('*')
    .ilike('SportName', `%${input}%`)
    .limit(10)

  if (error) {
    console.error('Error fetching sports:', error)
    return []
  }

  return data.map(sport => ({ ...sport, type: 'sport' }))
}