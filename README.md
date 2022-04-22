# REST API Cuaca & Gempa Terkini

REST API prakiraan cuaca, suhu udara, kelembapan udara, kecepatan angin, dan arah angin untuk kota-kota besar di **34 provinsi** di Indonesia dalam waktu **3 harian** dan gempa terbaru dengan format JSON yang lebih ramah.

Sumber: [Data Terbuka BMKG](https://data.bmkg.go.id/).

## DEMO

[https://cuaca-gempa-rest-api.vercel.app](https://cuaca-gempa-rest-api.vercel.app)

## Command

- `npm start` - run server.
- `npm run dev` - run dev server.

## Gempa

**Endpoint**

`/quake`

**Response**

```json
{
  "success": true,
  "message": null,
  "data": {
    "tanggal": "08 Jun 2021",
    "jam": "12:00:34 WIB",
    "datetime": "2021-06-08T05:00:34+00:00",
    "coordinates": "0.35,123.75",
    "lintang": "0.35 LU",
    "bujur": "123.75 BT",
    "magnitude": "5.3",
    "kedalaman": "185 km",
    "wilayah": "Pusat gempa berada di darat 26 km BaratDaya Bolaanguki",
    "potensi": "Gempa ini dirasakan untuk diteruskan pada masyarakat",
    "dirasakan": "II Bolaang Mongondow Selatan",
    "shakemap": "https://data.bmkg.go.id/DataMKG/TEWS/20210608120034.mmi.jpg"
  }
}
```

## Cuaca

### Provinsi

**Endpoint:**

`/{provinsi}`

> :warning: Gunakan `/dki-jakarta` dan `di-yogyakarta` untuk Provinsi DKI Jakarta dan DI Yogyakarta.

**Contoh:**

`/jawa-barat`

**Response**

```json
{
  "success": true,
  "message": null,
  "data": {
    "issue": {
      "timestamp": "20210608025054",
      "year": "2021",
      "month": "06",
      "day": "08",
      "hour": "02",
      "minute": "50",
      "second": "54"
    },
    "areas": [
      {
        "id": "501212",
        "latitude": "-6.90992",
        "longitude": "107.64691",
        "coordinate": "107.64691 -6.90992",
        "type": "land",
        "region": "",
        "level": "1",
        "description": "Bandung",
        "domain": "Jawa Barat",
        "tags": "",
        "params": [
          {
            "id": "hu",
            "description": "Humidity",
            "type": "hourly",
            "times": [
              {
                "type": "hourly",
                "h": "0",
                "datetime": "202106080000",
                "value": "70 %"
              }
              // ....
            ]
          },
          {
            "id": "humax",
            "description": "Max humidity",
            "type": "daily",
            "times": [
              {
                "type": "daily",
                "day": "20210608",
                "datetime": "202106081200",
                "value": "90 %"
              }
              //....
            ]
          },
          {
            "id": "tmax",
            "description": "Max temperature",
            "type": "daily",
            "times": [
              {
                "type": "daily",
                "day": "20210608",
                "datetime": "202106081200",
                "celcius": "30 C",
                "fahrenheit": "86 F"
              }
              //...
            ]
          },
          {
            "id": "humin",
            "description": "Min humidity",
            "type": "daily",
            "times": [
              {
                "type": "daily",
                "day": "20210608",
                "datetime": "202106081200",
                "value": "50 %"
              }
              //...
            ]
          },
          {
            "id": "tmin",
            "description": "Min temperature",
            "type": "daily",
            "times": [
              {
                "type": "daily",
                "day": "20210608",
                "datetime": "202106081200",
                "celcius": "20 C",
                "fahrenheit": "68 F"
              }
              //...
            ]
          },
          {
            "id": "t",
            "description": "Temperature",
            "type": "hourly",
            "times": [
              {
                "type": "hourly",
                "h": "0",
                "datetime": "202106080000",
                "celcius": "25 C",
                "fahrenheit": "77 F"
              }
              //...
            ]
          },
          {
            "id": "weather",
            "description": "Weather",
            "type": "hourly",
            "times": [
              {
                "type": "hourly",
                "h": "0",
                "datetime": "202106080000",
                "code": "1",
                "name": "Cerah Berawan"
              }
              //...
            ]
          },
          {
            "id": "wd",
            "description": "Wind direction",
            "type": "hourly",
            "times": [
              {
                "type": "hourly",
                "h": "0",
                "datetime": "202106080000",
                "deg": "135",
                "card": "SE",
                "sexa": "13500"
              }
              //...
            ]
          },
          {
            "id": "ws",
            "description": "Wind speed",
            "type": "hourly",
            "times": [
              {
                "type": "hourly",
                "h": "0",
                "datetime": "202106080000",
                "kt": "5",
                "mph": "5.75389725",
                "kph": "9.26",
                "ms": "2.57222222"
              }
              //...
            ]
          }
        ]
      }
      //...
    ]
  }
}
```

### Kota

**Endpoint:**

`/{provinsi}/{kota}`

**Contoh:**

`/jawa-barat/bandung`

**Response:**

```json
{
  "success": true,
  "message": null,
  "data": {
    "id": "501212",
    "latitude": "-6.90992",
    "longitude": "107.64691",
    "coordinate": "107.64691 -6.90992",
    "type": "land",
    "region": "",
    "level": "1",
    "description": "Bandung",
    "domain": "Jawa Barat",
    "tags": "",
    "params": [
      {
        "id": "hu",
        "description": "Humidity",
        "type": "hourly",
        "times": [
          {
            "type": "hourly",
            "h": "0",
            "datetime": "202106080000",
            "value": "70 %"
          }
          //..
        ]
      },
      {
        "id": "humax",
        "description": "Max humidity",
        "type": "daily",
        "times": [
          {
            "type": "daily",
            "day": "20210608",
            "datetime": "202106081200",
            "value": "90 %"
          }
          //...
        ]
      },
      {
        "id": "tmax",
        "description": "Max temperature",
        "type": "daily",
        "times": [
          {
            "type": "daily",
            "day": "20210608",
            "datetime": "202106081200",
            "celcius": "30 C",
            "fahrenheit": "86 F"
          }
          //...
        ]
      },
      {
        "id": "humin",
        "description": "Min humidity",
        "type": "daily",
        "times": [
          {
            "type": "daily",
            "day": "20210608",
            "datetime": "202106081200",
            "value": "50 %"
          }
          //...
        ]
      },
      {
        "id": "tmin",
        "description": "Min temperature",
        "type": "daily",
        "times": [
          {
            "type": "daily",
            "day": "20210608",
            "datetime": "202106081200",
            "celcius": "20 C",
            "fahrenheit": "68 F"
          }
          //...
        ]
      },
      {
        "id": "t",
        "description": "Temperature",
        "type": "hourly",
        "times": [
          {
            "type": "hourly",
            "h": "0",
            "datetime": "202106080000",
            "celcius": "25 C",
            "fahrenheit": "77 F"
          }
          //...
        ]
      },
      {
        "id": "weather",
        "description": "Weather",
        "type": "hourly",
        "times": [
          {
            "type": "hourly",
            "h": "0",
            "datetime": "202106080000",
            "code": "1",
            "name": "Cerah Berawan"
          }
          //...
        ]
      },
      {
        "id": "wd",
        "description": "Wind direction",
        "type": "hourly",
        "times": [
          {
            "type": "hourly",
            "h": "0",
            "datetime": "202106080000",
            "deg": "135",
            "card": "SE",
            "sexa": "13500"
          }
          //...
        ]
      },
      {
        "id": "ws",
        "description": "Wind speed",
        "type": "hourly",
        "times": [
          {
            "type": "hourly",
            "h": "0",
            "datetime": "202106080000",
            "kt": "5",
            "mph": "5.75389725",
            "kph": "9.26",
            "ms": "2.57222222"
          }
          //...
        ]
      }
    ]
  }
}
```
