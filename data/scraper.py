import pandas as pd
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
import os


options = Options()
options.add_argument('user-data-dir=C:\\Users\\lukas\\AppData\\Local\\Google\\Chrome\\User Data')
options.headless=False

browser = webdriver.Chrome('data/chromedriver.exe', options=options)

OLYMPICS_URL = "https://olympics.com"

def scrape_sports(formatedUrl="https://olympics.com/en/olympic-games/tokyo-2020"):
    browser.get(formatedUrl)

    games_Id = formatedUrl.split("/")[-1]

    browser.execute_script("window.scrollTo(0, 1080)")
    time.sleep(1)
    browser.execute_script("window.scrollTo(0, 2580)")
    time.sleep(1)
    browser.execute_script("window.scrollTo(0, 3280)")
    time.sleep(1)
    browser.execute_script("window.scrollTo(0, 4480)")
    time.sleep(1)
    browser.execute_script("window.scrollTo(0, 5580)")
    time.sleep(1)


    html_source = browser.page_source
    
    soup = BeautifulSoup(html_source, 'html.parser')

    div = soup.find('div', id='olympic-games-disciplines')
    disciplines = soup.find_all('a', {'data-cy': 'disciplines-item'})

    data = []
    for discipline in disciplines:
        discipline_text = discipline.text
        discipline_href = discipline['href']
        data.append({'Text': discipline_text, 'Link': OLYMPICS_URL + discipline_href, 'Games_Id': games_Id})

    save_to_csv(data, '{}-sports.csv'.format(games_Id))

def scrape_events(link="https://olympics.com/en/olympic-games/tokyo-2020/results/table-tennis"):
    gamesId = link.split("/")[-3]
    sport = link.split("/")[-1]

    browser.get(link)

    time.sleep(3)

    browser.execute_script("window.scrollTo(0, 1080)")

    html_source = browser.page_source
    
    soup = BeautifulSoup(html_source, 'html.parser')

    events = soup.select('section[class*="event-row"]')

    data = []
    for event in events:
        event_name = event.find('h2').text
        link = event.find('a', {'data-cy': 'next-link'})
        if link is None:
            link = event.find('a', {'data-cy': 'link'})
        full_results_link = link.get('href')

        data.append({'Sport': sport,'Event': event_name, 'Link':OLYMPICS_URL + full_results_link, 'GamesId': gamesId})

    save_to_csv(data, '{}-events.csv'.format(gamesId))

def scrape_results(link="https://olympics.com/en/olympic-games/tokyo-2020/results/table-tennis/men-s-singles"):
    browser.get(link)

    gamesId = link.split("/")[-4]
    sport = link.split("/")[-2]
    event = link.split("/")[-1]
    
    time.sleep(3)
    browser.execute_script("window.scrollTo(0, 540)")

    html_source = browser.page_source
    
    soup = BeautifulSoup(html_source, 'html.parser')

    if soup.find('div', {'data-cy': 'single-athlete-result-row'}) is not None:
        single_results = soup.findAll('div', {'data-cy': 'single-athlete-result-row'})
        handle_single_result_rows(single_results, gamesId, sport, event)
    elif soup.find('div', {'data-cy': 'doubles-result-row'}) is not None:
        double_results = soup.findAll('div', {'data-cy': 'doubles-result-row'})
        handle_doubles_result_rows(double_results, gamesId, sport, event)
    elif soup.find('div', {'data-cy': 'team-result-row'}) is not None:
        team_results = soup.findAll('div', {'data-cy': 'team-result-row'})
        counter = 1
        for team_result in team_results:
            try:
                browser.find_element_by_xpath('/html/body/div[1]/div[2]/section/section[3]/div/div/div[2]/div[{}]/span'.format(counter * 2)).click()
                time.sleep(0.5)
                counter += 1
            except:
                continue

        html_source = browser.page_source
        soup = BeautifulSoup(html_source, 'html.parser')
        team_results = soup.findAll('div', {'data-cy': 'team-result-row'})
        handle_team_result_rows(team_results, gamesId, sport, event)


def handle_single_result_rows(results, gamesId, sport, event):
    data = []
    counter = 1
    for result in results:
        position = result.find('div', {'data-cy': 'medal'}).get('title')
        athlete_name = result.find('h3', {'data-cy': 'athlete-name'}).text
        athlete_link = "N/A" if result.find('a', {'data-cy': 'link'}) is None else result.find('a', {'data-cy': 'link'}).get('href')
        result_value = result.find('span', {'data-cy': 'result-row-{}'.format(counter)}).find('span', {'data-cy': 'result-info-content'})
        if result_value is not None:
            result_value = result_value.text
        notes = result.find('span', {'data-cy': 'notes-row-{}'.format(counter)}).find('span', {'data-cy': 'result-info-content'})
        if notes is not None:
            notes = notes.text

        flag_with_label = result.find('div', {'data-cy': 'flag-with-label'})
        flag_url = flag_with_label.find('img').get('src')
        country = flag_with_label.find('img').get('alt')

        data.append({'Athlete': athlete_name, 'Link': athlete_link, 'Position': position, 'Country': country, 'Flag': flag_url, 'Result': result_value, 'Notes': notes,
                     'GamesId': gamesId, 'Sport': sport, 'Event': event})

        counter += 1
    
    save_to_csv(data, '{}-results.csv'.format(gamesId))

def handle_doubles_result_rows(results, gamesId, sport, event):
    data = []
    counter = 1
    for result in results:
        athletes = []
        athletes_divs = result.findAll('div', {'data-cy': 'athlete-image-name'})
        for athlete_div in athletes_divs:
            athlete_name = athlete_div.find('h3', {'data-cy': 'athlete-name'}).text
            athlete_link = "N/A" if result.find('a', {'data-cy': 'link'}) is None else result.find('a', {'data-cy': 'link'}).get('href')
            athletes.append({'Athlete': athlete_name, 'Link': athlete_link})
        position = result.find('div', {'data-cy': 'medal'}).get('title')
        result_value = result.find('span', {'data-cy': 'result-row-{}'.format(counter)}).find('span', {'data-cy': 'result-info-content'})
        if result_value is not None:
            result_value = result_value.text
        notes = result.find('span', {'data-cy': 'notes-row-{}'.format(counter)}).find('span', {'data-cy': 'result-info-content'})
        if notes is not None:
            notes = notes.text

        flag_with_label = result.find('div', {'data-cy': 'flag-with-label'})
        flag_url = flag_with_label.find('img').get('src')
        country = flag_with_label.find('img').get('alt')

        for athlete in athletes:
            data.append({'Athlete': athlete["Athlete"], 'Link': athlete["Link"], 'Position': position, 'Country': country, 'Flag': flag_url, 'Result': result_value, 'Notes': notes,
                     'GamesId': gamesId, 'Sport': sport, 'Event': event})

        counter += 1
    
    save_to_csv(data, '{}-results.csv'.format(gamesId))

def handle_team_result_rows(results, gamesId, sport, event):
    data = []
    counter = 1

    for result in results:
        athletes = []
        athletes_as = result.findAll('a', {'data-cy': 'team-member'})
        for athlete_a in athletes_as:
            athlete_name = athlete_a.find('span').text
            athlete_link = athlete_a.get('href')
            athletes.append({'Athlete': athlete_name, 'Link': athlete_link})
        position = result.find('div', {'data-cy': 'medal'}).get('title')
        result_value = result.find('span', {'data-cy': 'result-row-{}'.format(counter)}).find('span', {'data-cy': 'result-info-content'})
        if result_value is not None:
            result_value = result_value.text
        notes = result.find('span', {'data-cy': 'notes-row-{}'.format(counter)}).find('span', {'data-cy': 'result-info-content'})
        if notes is not None:
            notes = notes.text

        flag_with_label = result.find('div', {'data-cy': 'flag-row-{}'.format(counter)})
        flag_url = flag_with_label.find('img').get('src')
        country = flag_with_label.find('img').get('alt')

        for athlete in athletes:
            data.append({'Athlete': athlete["Athlete"], 'Link': athlete["Link"], 'Position': position, 'Country': country, 'Flag': flag_url, 'Result': result_value, 'Notes': notes,
                     'GamesId': gamesId, 'Sport': sport, 'Event': event})
        
        if athletes == []:
            data.append({'Athlete': "N/A", 'Link': "N/A", 'Position': position, 'Country': country, 'Flag': flag_url, 'Result': result_value, 'Notes': notes,
                     'GamesId': gamesId, 'Sport': sport, 'Event': event})

        counter += 1
    
    save_to_csv(data, '{}-results.csv'.format(gamesId))

def save_to_csv(data, filename):
    df = pd.DataFrame(data)
    if not os.path.exists('data/data/' + filename):
        df.to_csv('data/data/' + filename, index=False)
        return
    existing_df = pd.read_csv('data/data/' + filename)
    combined_df = pd.concat([existing_df, df], ignore_index=True)
    cleaned_df = combined_df.drop_duplicates()
    cleaned_df.to_csv('data/data/' + filename, index=False)


def scrape_all_sports():
    df = pd.read_csv("data/OlympicGames.csv")
    for index, row in df.iterrows():
        link = row['Link']
        scrape_sports(link)

def scrape_all_events():
    df = pd.read_csv("data/OlympicGames.csv")
    for index, row in df.iterrows():
        gamesId = row['Link'].split("/")[-1]
        scrape_all_events_of_games(gamesId)

def scrape_all_events_of_games(olympic_games):
    df = pd.read_csv("data/data/{}-sports.csv".format(olympic_games))
    for index, row in df.iterrows():
        link = row['Link']
        scrape_events(link)

def scrape_all_results():
    df = pd.read_csv("data/OlympicGames.csv")
    for index, row in df.iterrows():
        gamesId = row['Link'].split("/")[-1]
        scrape_all_results_of_games(gamesId)

def scrape_all_results_of_games(olympic_games):
    df = pd.read_csv("data/data/{}-events.csv".format(olympic_games))
    for index, row in df.iterrows():
        link = row['Link']
        scrape_results(link)


def main():
    scrape_all_sports()
    scrape_all_events()
    scrape_all_results()
    
    browser.quit()

if __name__ == '__main__':
    main()