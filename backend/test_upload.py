import requests

def test_upload():
    url = 'http://localhost:8000/uploads'
    file_path = 'test.pdf'  # Создайте тестовый файл
    
    with open(file_path, 'rb') as f:
        files = {'file': f}
        data = {'type': 'document'}
        response = requests.post(url, files=files, data=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json() if response.ok else response.text}")

if __name__ == "__main__":
    test_upload() 