## Description

Thmanyah CMS - A content management system built with [NestJS](https://github.com/nestjs/nest).

## Getting Started

### Prerequisites

- Node.js (v18+)
- Docker & Docker Compose
- Git

### Installation

1. **Clone the repository**

   ```bash
   $ git clone https://github.com/md7o/thmanyah-cms.git
   $ cd thmanyah-cms
   ```

2. **Setup Environment Variables**

   Create a `.env` file in the root directory. You can copy the example below:

   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_NAME=thmanyah_cms
   DB_SSL=false

   # Redis
   REDIS_HOST=localhost
   REDIS_PORT=6379

   # Elasticsearch
   ELASTICSEARCH_NODE=http://localhost:9200
   ELASTICSEARCH_USERNAME=elastic
   ELASTICSEARCH_PASSWORD=changeme

   # YouTube API (Optional for Import)
   YOUTUBE_API_KEY=your_api_key
   YOUTUBE_CHANNEL_ID=your_channel_id
   ```

3. **Install Dependencies**

   ```bash
   $ npm install
   ```

### Running the Application

1. **Start Infrastructure Services**

   Start PostgreSQL, Elasticsearch, and Redis using Docker:

   ```bash
   $ docker-compose up -d
   ```

2. **Start the Server**

   ```bash
   # development
   $ npm run start

   # watch mode
   $ npm run start:dev

   # production mode
   $ npm run start:prod
   ```

   The API will be available at: http://localhost:3000
   Swagger Documentation: http://localhost:3000/api

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
