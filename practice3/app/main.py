from fastapi import FastAPI

app = FastAPI()


@app.get('/')
async def start():
    return {
        'A': 'B'
    }


@app.get('/aaaa')
async def aaa():
    return 'aaa'
