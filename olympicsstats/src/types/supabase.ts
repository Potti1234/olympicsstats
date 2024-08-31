export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      Athlete: {
        Row: {
          Athlete_Name: string | null
          Country_Code: string | null
          Country_Id: string | null
          Country_Name: string | null
          Flag: string | null
          Id: string
          Link: string | null
        }
        Insert: {
          Athlete_Name?: string | null
          Country_Code?: string | null
          Country_Id?: string | null
          Country_Name?: string | null
          Flag?: string | null
          Id: string
          Link?: string | null
        }
        Update: {
          Athlete_Name?: string | null
          Country_Code?: string | null
          Country_Id?: string | null
          Country_Name?: string | null
          Flag?: string | null
          Id?: string
          Link?: string | null
        }
        Relationships: []
      }
      Country: {
        Row: {
          Code: string | null
          Flag: string | null
          Id: string
          Name: string | null
        }
        Insert: {
          Code?: string | null
          Flag?: string | null
          Id: string
          Name?: string | null
        }
        Update: {
          Code?: string | null
          Flag?: string | null
          Id?: string
          Name?: string | null
        }
        Relationships: []
      }
      Event: {
        Row: {
          Event: string | null
          EventName: string | null
          Id: string
          Link: string | null
          Sport_Id: string | null
        }
        Insert: {
          Event?: string | null
          EventName?: string | null
          Id: string
          Link?: string | null
          Sport_Id?: string | null
        }
        Update: {
          Event?: string | null
          EventName?: string | null
          Id?: string
          Link?: string | null
          Sport_Id?: string | null
        }
        Relationships: []
      }
      OlympicGame: {
        Row: {
          City: string | null
          Games_Id: string | null
          Id: string
          "Image URL": string | null
          Link: string | null
          Season: string | null
          Year: number | null
        }
        Insert: {
          City?: string | null
          Games_Id?: string | null
          Id: string
          "Image URL"?: string | null
          Link?: string | null
          Season?: string | null
          Year?: number | null
        }
        Update: {
          City?: string | null
          Games_Id?: string | null
          Id?: string
          "Image URL"?: string | null
          Link?: string | null
          Season?: string | null
          Year?: number | null
        }
        Relationships: []
      }
      result: {
        Row: {
          Athlete_Id: number | null
          Event_Id: number | null
          Games_Id: string | null
          Id: string
          Notes: string | null
          Position: string | null
          Result: string | null
          Sport_Id: number | null
          Team_Id: number | null
        }
        Insert: {
          Athlete_Id?: number | null
          Event_Id?: number | null
          Games_Id?: string | null
          Id: string
          Notes?: string | null
          Position?: string | null
          Result?: string | null
          Sport_Id?: number | null
          Team_Id?: number | null
        }
        Update: {
          Athlete_Id?: number | null
          Event_Id?: number | null
          Games_Id?: string | null
          Id?: string
          Notes?: string | null
          Position?: string | null
          Result?: string | null
          Sport_Id?: number | null
          Team_Id?: number | null
        }
        Relationships: []
      }
      Sport: {
        Row: {
          Games_Id: string | null
          Games_Name: string | null
          Id: string
          Link: string | null
          Sport: string | null
          SportName: string | null
        }
        Insert: {
          Games_Id?: string | null
          Games_Name?: string | null
          Id: string
          Link?: string | null
          Sport?: string | null
          SportName?: string | null
        }
        Update: {
          Games_Id?: string | null
          Games_Name?: string | null
          Id?: string
          Link?: string | null
          Sport?: string | null
          SportName?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
