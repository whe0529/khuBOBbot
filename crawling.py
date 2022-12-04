import requests 
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from time import sleep
import pandas as pd 
from webdriver_manager.chrome import ChromeDriverManager

url = 'https://map.kakao.com/'
driver = webdriver.Chrome(ChromeDriverManager().install())
driver.get(url)
key_word = '영통역식당'  

# CSS_SELECTOR를 찾을 때까지 일정 시간 대기
def time_wait(num, code):
    try:
        wait = WebDriverWait(driver, num).until(
            EC.presence_of_element_located((By.ID, code)))
    except:
        print(code, '태그를 찾지 못하였습니다.')
        driver.quit()
    return wait

time_wait(10,'search.keyword.query') # 10초 대기
search = driver.find_element(By.ID, 'search.keyword.query') # 검색창 찾기
search.send_keys(key_word)  # 검색어 입력
search.send_keys(Keys.ENTER) # 엔터버튼 누르기

res = driver.page_source  # 페이지 소스 가져오기
soup = BeautifulSoup(res, 'html.parser')  # html 파싱하여  가져온다
sleep(1)

name_list = driver.find_elements(By.CLASS_NAME ,'link_name')
num_list = driver.find_elements(By.CSS_SELECTOR ,'em.num')
address_list = driver.find_elements(By.CLASS_NAME ,'addr')

print(len(name_list))
print(len(num_list))
print(len(address_list))

data = []

for i in range(len(name_list)):
    store_info = []
    store_info.append(name_list[i].text)
    store_info.append(num_list[i].text)
    store_info.append(address_list[i].text)
    data.append(store_info)
    print(store_info)
    
driver.find_element(By.XPATH,'//*[@id="info.search.place.more"]').send_keys(Keys.ENTER)
sleep(2)
name_list = driver.find_elements(By.CLASS_NAME ,'link_name')
num_list = driver.find_elements(By.CSS_SELECTOR ,'em.num')
address_list = driver.find_elements(By.CLASS_NAME ,'addr')

print(len(name_list))
print(len(num_list))
print(len(address_list))

for i in range(len(name_list)):
    store_info = []
    store_info.append(name_list[i].text)
    store_info.append(num_list[i].text)
    store_info.append(address_list[i].text)
    data.append(store_info)
    print(store_info)

# 3 ~ 5페이지 읽기
for i in range(3, 6):
    # 페이지 넘기기
    xPath = '//*[@id="info.search.page.no' + str(i) + '"]'
    driver.find_element(By.XPATH,xPath).send_keys(Keys.ENTER)
    sleep(1)
    name_list = driver.find_elements(By.CLASS_NAME ,'link_name')
    num_list = driver.find_elements(By.CSS_SELECTOR ,'em.num')
    address_list = driver.find_elements(By.CLASS_NAME ,'addr')
    
    print(len(name_list))
    print(len(num_list))
    print(len(address_list))
    
    for i in range(len(name_list)):
        store_info = []
        store_info.append(name_list[i].text)
        store_info.append(num_list[i].text)
        store_info.append(address_list[i].text)
        data.append(store_info)
        print(store_info)

col_name = ['식당 이름', '평점', '주소']
df = pd.DataFrame(data, columns = col_name)
print("\n")
print(df)
df.to_excel("data.xlsx")