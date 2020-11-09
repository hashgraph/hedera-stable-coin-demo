# Hedera Stable Coin Demo

## Prerequisites

 - Java 14+
 
 - PostgreSQL 12+

 - [TimescaleDB](https://www.timescale.com/)

 - Node 10+

 - Yarn

_see [install prerequisites](#install-prerequisites) at the end of this document for assistance if needed_

## Clone from GitHub

_Note: Assumes `git` is installed

```shell script
# Clone repository
git clone https://github.com/hashgraph/hedera-stable-coin-demo.git
cd hedera-stable-coin-demo
git submodule update --init
```

## Components

#### Contract — `stable-coin-java-hcs` 

Reference implementation in Java of a Hedera Stable Coin.

refer to [Hedera Stable Coin](https://github.com/hashgraph/hedera-stable-coin/blob/master/README.md) for deployment details.

###### Build

```shell script
cd ~/hedera-stable-coin-demo/stable-coin-java-hcs
./gradlew flywayMigrate jooqGenerate build
```

#### Platform — `stable-coin-platform`

Sample implementation of a larger platform around a Stable Coin network. 

###### Build

```shell script
cd ~/hedera-stable-coin-demo/stable-coin-platform
# Create the database
sudo su -l postgres
createdb -h localhost -U postgres stable_coin_platform
# CTRL+D to exit postgres user shell

./gradlew flywayMigrate jooqGenerate build
```

###### Setup environment

Copy `.env.sample` to `.env` and edit
```shell script
cp .env.sample .env
nano .env
``` 

**Operator on Hedera to use to execute any needed transactions. This is the account that will get charged.**

- HSC_OPERATOR_ID=0.0.___
- HSC_OPERATOR_KEY=302e___

**HTTP Port**

- HSC_HTTP_PORT=9005

**Node Id to use when creating transactions**

- HSC_FIXED_NODE_ID=0.0.3

**Topic on Hedera to use**

- HSC_TOPIC_ID=0.0.____

**Database information for transaction and event logging**

- PLATFORM_DATABASE_URL=postgresql://localhost:5432/stable_coin_platform
- PLATFORM_DATABASE_USERNAME=postgres
- PLATFORM_DATABASE_PASSWORD=password

**Private keys Used for marking an account as passing KYC**

_HSC = Hedera Stable Coin, ESC = Ethereum Stable Coin_

- HSC_COMPLIANCE_MANAGER_KEY=302e02__
- ESC_COMPLIANCE_MANAGER_KEY=0x___

**Used for minting money to accounts**

_HSC = Hedera Stable Coin, ESC = Ethereum Stable Coin_

- HSC_SUPPLY_MANAGER_KEY=302e02__
- ESC_SUPPLY_MANAGER_KEY=0x___

**URL to a remote node for interacting with the ethereum network**

_Note: Leave empty/commented if you don't want to use the bridge feature_

- ESC_NODE_URL="https://___.infura.io/v3/____"

**Address of the Stable Coin contract on Ethereum**
- ESC_CONTRACT_ADDRESS="0x___"

###### Run
```
java -jar build/libs/stable-coin-platform-1.0.0.jar
```

#### Protobuf definitions - `stable-coin-proto-js`

Message definitions for use by the clients

###### Build

```shell script
cd ~/hedera-stable-coin-demo/stable-coin-proto-js
# compile
yarn
# create a link for other projects
yarn link
```

#### JavaScript SDK - `stable-coin-sdk-js'

SDK for use by the client and admin user interfaces

###### Build

```shell script
cd ~/hedera-stable-coin-demo/stable-coin-sdk-js
# link to stable-coin-proto-js
yarn link "@stable-coin/proto"
# compile
yarn
# create a link for other projects
yarn link
```

#### Client — `stable-coin-client`

Sample implementation of a client on top of the platform **and** network.

###### Build

```shell script
cd ~/hedera-stable-coin-demo/stable-coin-client
# link to stable-coin-sdk-js
yarn link "@stable-coin/sdk"
# compile
yarn
```

###### Setup environment

_Note: These instructions are for running in development, for a production build, create a `.env.production` file.

```shell script
# copy sample environment file
cp .env.sample .env
# edit environment file
nano .env
```

**Operator account num (no leading 0.0.)**

- VUE_APP_OPERATOR_ACCOUNT_NUM=

**Address of the stable coin platform**

- VUE_APP_HSC_PLATFORM="http://localhost:9005"

**Port the app net nodes we connect to listen onto**

- VUE_APP_HSC_APPNET_PORT=9000

**List of appnet node end points for the clients**

- VUE_APP_APP_NET_NODES=[{"address": "localhost:8080"}]

**Ethereum Contract Address**

- VUE_APP_ETH_CONTRACT_ADDRESS="0x125b7195212f40faD937444C29D99eA4990E88f1"

###### Run

_Choose the port you wish to run the client on in the command below_

```
yarn serve --port 8082
```

#### Admin — `stable-coin-admin`

Sample implementation of an administration portal on top of the platform **and** network.

```shell script
cd ~/hedera-stable-coin-demo/stable-coin-admin
# link to stable-coin-sdk-js
yarn link "@stable-coin/sdk"
# compile
yarn
```

###### Setup environment

_Note: These instructions are for running in development, for a production build, create a `.env.production` file.

```shell script
# copy sample environment file
cp .env.sample .env
# edit environment file
nano .env
```


**Operator account num (no leading 0.0.)**

- VUE_APP_OPERATOR_ACCOUNT_NUM=

**Address of the stable coin platform**

- VUE_APP_HSC_PLATFORM="http://localhost:9005"

**appnet Nodes**

_Note: This is for rendering nodes on a map, not critical_

- VUE_APP_APP_NET_NODES=[{"name": "Node 1", "address": "localhost:8080","left": "230px", "top", "150px"}]

** Ethereum Contract Address**
VUE_APP_ETH_CONTRACT_ADDRESS="0x125b7195212f40faD937444C29D99eA4990E88f1"

###### Run

_Choose the port you wish to run the client on in the command below_

```
yarn serve --port 8083
```

## Install prerequisites

Note: These installation instructions are applicable to `Debian 4.19`, other operating systems may differ.

### Java 14+

Refer to: https://github.com/hashgraph/hedera-stable-coin/blob/master/README.md

### TimescaleDB

Refer to: https://github.com/hashgraph/hedera-stable-coin/blob/master/README.md

### Node 10+

```shell script
# Update apt
sudo apt update

# Install node
sudo apt install nodejs npm

# Check installed version
node -v
# v10.21.0
```

### Yarn

_Note: Assumes `curl` is installed_

```shell script
# configure the repository
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list

# install yarn
sudo apt update
sudo apt install yarn
```

## License

Licensed under Apache License,
Version 2.0 – see [LICENSE](LICENSE) in this repo
or [apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0).
