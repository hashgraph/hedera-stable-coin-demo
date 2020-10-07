# Hedera Stable Coin Demo

## Prerequisites

 - Java 14+
 
 - Node 10+

 - PostgreSQL 12+

 - [TimescaleDB](https://www.timescale.com/)

 - Yarn

## Components

#### Contract — `stable-coin-java-hcs` 

Reference implementation in Java of a Hedera Stable Coin.

###### Build

Requires a connection to a development database. Default configuration 
expects `localhost/stable_coin`.

```
./gradlew flywayMigrate jooqGenerate build
```

###### Run

Copy `.env.sample` to `.env` and review. Token information is defined here. 

**Note: The firs time you run this, leave `HSC_TOPIC_ID=` blank. The code will create a Topic Id, output the ID to the console and construct the token.
Once this is done, you can update the `HSC_TOPIC_ID` in `.env` with this value and use the same in other `.env` files below.**

```
java -jar build/libs/stable-coin-0.2.0.jar
```

#### Platform — `stable-coin-platform`

Sample implementation of a larger platform around a Stable Coin network. 

###### Build

Requires a connection to a development database. Default configuration 
expects `localhost/stable_coin`.

```
./gradlew flywayMigrate jooqGenerate build
```

###### Run

Copy `.env.sample` to `.env` and review. 

```
java -jar build/libs/stable-coin-platform-1.0.0.jar
```

#### Client — `stable-coin-client`

Sample implementation of a client on top of the 
platform **and** network.

###### Build

```
yarn
```

###### Run

```
yarn serve
```

#### Admin — `stable-coin-admin`

Sample implementation of an administration portal on top of the 
platform **and** network.

###### Build

```
yarn
```

###### Run

```
yarn serve
```

## License

Licensed under Apache License,
Version 2.0 – see [LICENSE](LICENSE) in this repo
or [apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0).
