<a name="readme-top"></a>

<div align="center">
  <h3 align="center">Dhruva</h3>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li>
        <a href="#deployment">Deployment</a>
        <ul>
          <li><a href="#development">Development</a></li>
        </ul>
    </li>
    <li><a href="#migrations">Migrations</a></li>
    <li><a href="#seed">Seed</a></li>
    <li><a href="#contributing">Contributing</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

Dhruva is a full-fledged platform for serving AI models at scale.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

- [![Next][Nextjs]][Next-url]
- [![Chakra UI][Chakra-ui]][Chakra-url]
- [![FastApi][FastApi]][FastApi-url]
- [![Celery][Celery]][Celery-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

### Prerequisites

Get the .env file. This can be created from the .env.example, you just need to fill the values.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Installation

Clone both Dhruva-Platform and Dhruva-Seed.

```
git clone --recurse-submodules https://github.com/AI4Bharat/Dhruva-Platform
```

```
git clone https://github.com/AI4Bharat/Dhruva-Seed
```

Place the .env file in the root directory in Dhruva Platform

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Deployment

### Development

- Build the docker images for both the server and the client using the commands below.

  ```
  docker build -f Dockerfile -t server .
  ```

  ```
  docker build -f Dockerfile -t client .
  ```

- Build the docker image for the seed repository

  ```
  docker build -t seed .
  ```

- Run docker compose by using the `docker-compose-db.yml`, `docker-compose-metering.yml` and `docker-compose-monitoring.yml` as the compose files first.

  ```
  docker compose -f docker-compose-db.yml up -d
  ```

  ```
  docker compose -f docker-compose-metering.yml up -d
  ```

  ```
  docker compose -f docker-compose-monitoring.yml up -d
  ```

- Finally run docker compose with the `docker-compose-app.yml` file as the compose file.
  ```
  docker compose -f docker-compose-app.yml up -d
  ```

You should now be able to view the client at `http://localhost:{$FRONTEND_PORT}`. The server will be accessible at `http://localhost:{$BACKEND_PORT}`, with `$FRONTEND_PORT` and `$BACKEND_PORT` being the values set in the .env file.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MIGRATIONS -->

## Migrations

We use [mongodb-migrations](https://github.com/DoubleCiti/mongodb-migrations) to manage migrations. All migrations are stored in the migrations folder.

To create a new migration, run the following command:

```
mongodb-migrate-create --description <description>
```

This command will create a new migration `<timestamp>_<description>.py` in the migrations folder. A class `Migration` will be created for you. Implement the upgrade method, and optionally, the downgrade method.

Once implemented, you can run docker compose with `docker-compose-app.yml` as the compose file to run the migration.

After the migration is run, it will also add a new document in the `migrations` collection, in the database specified in the .env file, to ensure that each the migration only runs once.

Commit all migrations to the repository and do not delete any migration.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- TESTING -->

## Testing

To perform testing of the models hosted on Dhruva, please refer to the [Dhruva-Evaluation-Suite](https://github.com/AI4Bharat/Dhruva-Evaluation-Suite) repository.

* Functional testing allows users to easily benchmark their models after setting up on Dhruva against any dataset available on HuggingFace, with any metrics such as WER (for ASR), BleU (for NMT) and others.
* Users can also benchmark inference speeds of all endpoints and measure the Requests/sec rate using the Performance Testing tool
<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

1. Clone the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[Nextjs]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[Chakra-ui]: https://img.shields.io/badge/chakra--ui-black?logo=chakraui&style=for-the-badge
[Chakra-url]: https://chakra-ui.com/
[FastApi]: https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=FastAPI&logoColor=white
[FastApi-url]: https://fastapi.tiangolo.com/
[Celery]: https://img.shields.io/static/v1?style=for-the-badge&message=Celery&color=37814A&logo=Celery&logoColor=FFFFFF&label
[Celery-url]: https://docs.celeryq.dev/en/stable/
