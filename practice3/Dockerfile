FROM python:3.10

WORKDIR /code

COPY ./app /app

COPY .env .

COPY requirements.txt .

RUN pip install -r requirements.txt
