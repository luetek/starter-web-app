Proper Logging is one of the most important common usecase across all projects. We need it for debugging issues Proper logs goes a long way in making our software system maintanable.

## Problem and its discussion

In this module our goal is to ensure that every time we log something on the screen we have a request-id in the logs. This help us trace all the log for a given request. We have three kind of scenarios.

https://docs.nestjs.com/interceptors https://docs.nestjs.com/recipes/async-local-storage

### Http Request

This is a most common usecase we want that if the request contain a header with name `X-Request-Id` we want all our log to contain it. Now when we see the issue we can copy the `X-Request-Id` and search in the logs to narrow down the issue. If the client does not provide the `X-Request-Id` then we can create one using `uuid()` and then use that for logging and once the request is processed (successfully or error) return the `X-Request-Id` as a respone header.

### Scheduled Cron Task

In some use cases we will be running task using cron. Now in this scenario we need to assign a request-id to the given run of task. This help us avoid all the clutter in logs unrelated to the task. This will be a little tricky to implement.

### Async Task based on some Queue (Redis, Kafka, RabbitMQ)

This is also similar to previous case. Now we are starting a task based on entry in Database.

### Testing

Added a simple log to ping controller which will automatically add UUID

```typescript
  @Get()
  ping() {
    this.logger.log('ping called');
    return this.appService.getData();
  }
```

```
# use curl or browser to call the api and notice the x-request-id in headers
curl -v http://localhost:3000/api
*   Trying 127.0.0.1:3000...
* Connected to localhost (127.0.0.1) port 3000 (#0)
> GET /api HTTP/1.1
> Host: localhost:3000
> User-Agent: curl/7.81.0
> Accept: */*
>
* Mark bundle as not supporting multiuse
< HTTP/1.1 200 OK
< X-Powered-By: Express
< X-Request-Id: 94ad2875-baf4-4d7e-a32c-a3d79e2a2383
< Content-Type: application/json; charset=utf-8
< Content-Length: 23
< ETag: W/"17-TzGXketnjihp27LBaxXaC/GQ4Cw"
< Date: Fri, 29 Mar 2024 23:06:26 GMT
< Connection: keep-alive
< Keep-Alive: timeout=5
<
* Connection #0 to host localhost left intact
{"message":"Hello API"}
```

Check the logs

```
[Nest] 131599  - 03/29/2024, 3:28:32 PM     LOG undefined  Nest application successfully started
[Nest] 131599  - 03/29/2024, 3:28:32 PM     LOG undefined  🚀 Application is running on: http://localhost:3000/api
[Nest] 131599  - 03/29/2024, 3:28:58 PM     LOG [AppController] 18a62061-c23d-4189-8be8-5d5e8b87aed3  ping called
```

Notice the request-id before `ping called` log.
