import pandas as pd

def combine_scraped_data():
    games = pd.read_csv('data/OlympicGames.csv')
    combined_results = pd.DataFrame()
    combined_events = pd.DataFrame()
    combined_sports = pd.DataFrame()
    for index, row in games.iterrows():
        id = row['Link'].split('/')[-1]
        result = pd.read_csv('data/data/{}-results.csv'.format(id))
        event = pd.read_csv('data/data/{}-events.csv'.format(id))
        sport = pd.read_csv('data/data/{}-sports.csv'.format(id))

        combined_results = pd.concat([combined_results, result], ignore_index=True)
        combined_events = pd.concat([combined_events, event], ignore_index=True)
        combined_sports = pd.concat([combined_sports, sport], ignore_index=True)
    
    combined_results.to_csv('data/result_data/combined_results.csv', index=False)
    combined_events.to_csv('data/result_data/combined_events.csv', index=False)
    combined_sports.to_csv('data/result_data/combined_sports.csv', index=False)

def create_athlete_data():
    results = pd.read_csv('data/result_data/combined_results.csv')
    country_data = pd.read_csv('data/result_data/country_data.csv')

    athlete_data = results[['Athlete', 'Link', 'Country', 'Flag']].copy()
    athlete_data.columns = ['Athlete_Name', 'Link', 'Country', 'Flag']

    athlete_data["Flag"] = athlete_data["Flag"].str.replace('t_lqip/', '') 

    athlete_data = pd.merge(athlete_data, country_data, left_on=['Country', 'Flag'], right_on=['Name', 'Flag'], how='left')
    athlete_data = pd.merge(athlete_data, country_data, left_on=['Country', 'Flag'], right_on=['Code', 'Flag'], how='left')
    athlete_data = pd.merge(athlete_data, country_data, left_on=['Flag'], right_on=['Flag'], how='left')
    
    athlete_data["Country_Id"] = athlete_data["Id_x"].fillna(athlete_data["Id_y"]).fillna(athlete_data["Id"])
    athlete_data["Country_Name"] = athlete_data["Name_x"].fillna(athlete_data["Name_y"]).fillna(athlete_data["Name"])
    athlete_data["Country_Code"] = athlete_data["Code_x"].fillna(athlete_data["Code_y"]).fillna(athlete_data["Code"])

    athlete_data = athlete_data.drop(['Country', 'Id_x', 'Id_y', 'Name_x', 'Name_y', 'Code_x', 'Code_y', 'Id', 'Name', 'Code'], axis=1)

    athlete_data = athlete_data.drop_duplicates()
    athlete_data = athlete_data.drop_duplicates(['Athlete_Name', 'Flag'])
    athlete_data = athlete_data.drop_duplicates(['Athlete_Name', 'Link'])
    
    athlete_data.to_csv('data/result_data/athlete_data.csv', index=True, index_label='Id')

def create_country_data():
    results = pd.read_csv('data/result_data/combined_results.csv')

    country_data = results[['Country', 'Flag']].copy()
    country_data.columns = ['Name', 'Flag']

    country_data["Flag"] = country_data["Flag"].str.replace('t_lqip/', '') 

    country_data = country_data.drop_duplicates()

    three_letter_countries = country_data.where(country_data['Name'].str.len() == 3).dropna()
    country_data = country_data.where(country_data['Name'].str.len() != 3).dropna()

    country_data = pd.merge(three_letter_countries, country_data, on='Flag', how='left')

    country_data.columns = ['Code', 'Flag', 'Name']

    country_data = country_data.drop_duplicates(['Code', "Name"])

    country_data.to_csv('data/result_data/country_data.csv', index=True, index_label='Id')

def add_index_to_OlympicGames():
    games = pd.read_csv('data/result_data/OlympicGames.csv')
    games['Games_Id'] = games["Link"].str.split('/').str[-1]
    games.to_csv('data/result_data/OlympicGames.csv', index=False, index_label='Id')

def create_sports_data():
    sports = pd.read_csv('data/result_data/combined_sports.csv')
    games = pd.read_csv('data/result_data/OlympicGames.csv')

    sports = pd.merge(sports, games, left_on='Games_Id', right_on='Games_Id', how='left')
    sports = sports.drop(['City','Year','Season','Link_y','Image URL'], axis=1)
    sports.columns = ['Sport', 'Link', 'Games_Name', 'Games_Id']
    sports["SportName"] = sports["Link"].str.split('/').str[-1]

    sports.to_csv('data/result_data/sports_data.csv', index=True, index_label='Id')

def create_event_data():
    events = pd.read_csv('data/result_data/combined_events.csv')
    sports = pd.read_csv('data/result_data/sports_data.csv')

    events = pd.merge(events, sports, left_on=['GamesId', 'Sport'], right_on=['Games_Name', 'SportName'], how='left')
    events = events.drop(["Sport_x","GamesId","Sport_y","Link_y","Games_Name","Games_Id","SportName"], axis=1)
    events.columns = ['Event', 'Link', 'Sport_Id']
    events["EventName"] = events["Link"].str.split('/').str[-1]

    events.to_csv('data/result_data/event_data.csv', index=True, index_label='Id')

def create_result_data():
    results = pd.read_csv('data/result_data/combined_results.csv')
    athlete_data = pd.read_csv('data/result_data/athlete_data.csv')
    event_data = pd.read_csv('data/result_data/event_data.csv')
    sports_data = pd.read_csv('data/result_data/sports_data.csv')

    results["Position"] = results["Position"].replace("Gold", 1)
    results["Position"] = results["Position"].replace("Silver", 2)
    results["Position"] = results["Position"].replace("Bronze", 3)
    results["Position"] = results["Position"].replace("=", "")

    results = pd.merge(results, athlete_data, left_on=['Athlete', 'Link'], right_on=['Athlete_Name', 'Link'], how='left')

    results = create_teams_column(results)
    results = results.drop(['Athlete','Link','Country','Flag_x','Athlete_Name','Flag_y','Country_Id','Country_Name','Country_Code'], axis=1)
    results.columns = ['Event','GamesId', 'Athlete_Id', 'Notes', 'Position', 'Result', 'Sport', 'Team_Id']

    event_data = pd.merge(event_data, sports_data, left_on=['Sport_Id'], right_on=['Id'], how='left')
    event_data = event_data.drop(['Link_x', 'Link_y', 'Event', 'Id_y', 'Sport',], axis=1)

    results = pd.merge(results, event_data, left_on=['GamesId', 'Sport', 'Event'], right_on=['Games_Name', 'SportName', 'EventName'], how='left')
    results = results.drop(['Games_Name', 'SportName', 'EventName', 'GamesId', 'Sport', 'Event'], axis=1)
    results.columns = ['Athlete_Id','Notes','Position','Result','Team_Id',"Event_Id","Sport_Id","Games_Id"]

    results.to_csv('data/result_data/result_data.csv', index=True, index_label='Id')

def create_teams_column(results):
    df = pd.DataFrame()
    for (gamesId, sport, event) , group in results.groupby(['GamesId', 'Sport', 'Event']):
        group["last_position"] = group["Position"].shift(1)
        group["last_Country_Code"] = group["Country_Code"].shift(1)
        team_id = 0
        rowdf = pd.DataFrame()
        for index, row in group.iterrows():
            if row["Position"] == row["last_position"] and row["Country_Code"] == row["last_Country_Code"]:
                row["Team_Id"] = team_id
            else:
                team_id += 1
                row["Team_Id"] = team_id
            
            rowdf = rowdf.append(row)
        df = df.append(rowdf)
    df = df.drop(['last_position', 'last_Country_Code'], axis=1)
    return df


def main():
    create_result_data()

if __name__ == '__main__':
    main()