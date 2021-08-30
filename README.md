# Hedera Stable Coin Demo

## Prerequisites

In order to run the stable coin demo, you will need a Hedera account for the network you want to deploy against (Mainnet or Testnet).

Testnet accounts can easily be created via http://portal.hedera.com.

In addition to an account, you will need the following software components.

### Docker setup prerequisites

- Docker version 19.03.13

- Docker-compose version 1.27.4,

### Manual setup prerequisites

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
git submodule sync
git submodule update --init
```

### Docker setup

Running the demo through docker containers is the easiest way to get started.

#### Setup environment file for docker images

Copy the sample environment file

```shell script
cd Docker
cp .env.global.sample .env.global
nano .env.global
```

Set the environment variables

- HSC_OPERATOR_ID=0.0.xxxx
- HSC_OPERATOR_KEY=302e02xxx
- VUE_APP_OPERATOR_ACCOUNT_NUM=xxxx

Note: _If you are deploying to cloud infrastructure to be accessed by remote clients, edit the two lines below and replace `localhost` with the **public** IP address of your server such that it can be resolved by remote clients.

- VUE_APP_HSC_PLATFORM="http://localhost:8083"
- VUE_APP_APP_NET_NODES=[{"name": "Node 1", "address": "localhost:8082","left": "230px", "top": "150px"}]

Note: _no other changes are necessary at this stage, all other variables are set to default values_

#### Step 1 - build the images

The first step consists in building the images. You have two options here: either let the build pull the source code from github, or build from your local version of the repository.

Note: _The build scripts were prepared for MacOS, it's possible the scripts will need adaptation for alternative unix/linux distributions._

* Pull from github repository during build (this creates two additional staging images for the build)

Note: _You can specify a branch to build from, be sure to include `-b ` at the beginning of the environment variable._

```shell script
export BRANCH=""
#export BRANCH="-b branch_name"
./build.sh
```

* Build from local source

```shell script
./buildlocal.sh
```

Note: _These errors are perfectly normal during the build._

```text
Removing images
Error: No such image: stable-coin/buildjava:latest
Error: No such image: stable-coin/buildjs:latest
Error: No such image: stable-coin/client-ui:latest
Error: No such image: stable-coin/admin-ui:latest
Error: No such image: stable-coin/platform:latest
Error: No such image: stable-coin/token-node:latest
```

Note: _Running this build script will always clean up the environment before starting the build, for example, the volume created to persist the Postgres TimescaleDB files is deleted, the existing containers and images are also deleted_

#### Step 2 - start the containers

Once build is complete, you may start the containers with `docker-compose up`.

Watch the console output, there will be some errors which are normal at this stage.

```text
Creating network "docker_default" with the default driver
...
stable-coin-token-node | no Topic ID found, creating a new topic ...
...
stable-coin-token-platform | SEVERE: missing environment variable HSC_TOPIC_ID
...
stable-coin-token-platform exited with code 0
stable-coin-token-node | created topic 0.0.107057
stable-coin-token-node | creating contract for token
stable-coin-token-node | pausing 10s
...
stable-coin-token-node | ..........
stable-coin-token-node | starting listener on mirror for topic 0.0.107058 ...
stable-coin-token-node | listening on topic 0.0.107058 from 1970-01-01T00:00:00Z
stable-coin-token-node | Listening on port : 8082
stable-coin-token-node | Nov 16, 2020 1:59:36 PM org.jooq.tools.JooqLogger info
```

`CTRL+C` as soon as `stable-coin-token-node | Listening on port : 8082` appears on the console.

#### Step 3 - Update .env.global with Topic ID

edit the `.env.global` file with the Topic Id

```shell script
nano .env.global
```

locate the line that starts with `#HSC_TOPIC_ID=`.

Uncomment the line and input the Topic ID created in the previous step (For example: `HSC_TOPIC_ID=0.0.107057`) and save the changes.

#### Step 4 - Run the containers again

```shell script
docker-compose up
```

or if you wish to leave the containers running in the background:

```shell script
docker-compose start
```

Note: _You may stop and re-run the containers as often as you wish_

#### Step 5 - Test the UIs

The client user interface should now be available at http://`serverip`:8080 and the admin user interface at http://`serverip`:8081.

Try to register a new user in two separate browser windows.

Note: _cookies are used so two browsers such as chrome and safari may need to be started in parallel for this_

Note: _if you have reset the environment resulting in a new Topic Id, it will be necessary to clear cookies in your browsers so they don't assume a prior "identity"_


You should then be able to "buy" stable coin and transfer between users.

To use the compliance features of the admin interface (freeze and clawback), you will need this `admin` key (which is specified in the `.env.global` file): `HSC_COMPLIANCE_MANAGER_KEY=302e020100300506032b65700422042079f3d3cbc2106d5a83193c2fca68730b4ba413de0b534b990365423f2c05f3fd`

### Manual setup

The sections below detail how to setup the stable coin demo.

- The `stable-coin-java-hcs` (the contract) implements the logic necessary to maintain state for a stable coin across multiple stable coin nodes.

- The `stable-coin-platform` is used by clients to sign transactions on behalf of the Hedera Network account (if clients had their own Hedera account, they could sign transactions themselves).

- The `stable-coin-proto-js` is a set of protobuf messages that define the operations that are available to the stable coin network.

- The `stable-coin-sdk-js` is an SDK used by the clients.

- The `stable-coin-client` is an example wallet application for end users.

- The `stable-coin-admin` is an example administration UI for compliance and other functions.

### Contract — `stable-coin-java-hcs`

Reference implementation in Java of a Hedera Stable Coin.

refer to [Hedera Stable Coin](https://github.com/hashgraph/hedera-stable-coin/blob/master/README.md) for deployment details.

### Platform — `stable-coin-platform`

Sample implementation of a larger platform around a Stable Coin network.

#### Build stable-coin-platform

```shell script
cd hedera-stable-coin-demo/stable-coin-platform
# Create the database
sudo su -l postgres
createdb -h localhost -U postgres stable_coin_platform
# CTRL+D to exit postgres user shell

./gradlew build
```

#### Setup environment for stable-coin-platform

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

**Topic on Hedera to use (copy from stable-coin-java-hcs .env)**

- HSC_TOPIC_ID=0.0.____

**Database information for transaction and event logging**

- PLATFORM_DATABASE_URL=postgresql://localhost:5432/
- PLATFORM_DATABASE_DB=stable_coin_platform
- PLATFORM_DATABASE_USERNAME=postgres
- PLATFORM_DATABASE_PASSWORD=password

**Private keys Used for marking an account as passing KYC**

_HSC = Hedera Stable Coin, ESC = Ethereum Stable Coin_

- HSC_COMPLIANCE_MANAGER_KEY=302e02__ (you may use your operator private key for initial testing)
- ESC_COMPLIANCE_MANAGER_KEY=0x___

**Used for minting money to accounts**

_HSC = Hedera Stable Coin, ESC = Ethereum Stable Coin_

- HSC_SUPPLY_MANAGER_KEY=302e02__ (you may use your operator private key for initial testing)
- ESC_SUPPLY_MANAGER_KEY=0x___

**URL to a remote node for interacting with the ethereum network**

_Note: Leave empty/commented if you don't want to use the bridge feature_

- ESC_NODE_URL="https://___.infura.io/v3/____"

**Address of the Stable Coin contract on Ethereum**

- ESC_CONTRACT_ADDRESS="0x___"

#### Run stable-coin-platform

```shell script
java -jar build/libs/stable-coin-platform-1.0.0.jar
```

should output

```shell script
...
Platform listening on port: 9005
...
```

### Protobuf definitions - `stable-coin-proto-js`

Message definitions for use by the clients

#### Build stable-coin-proto-js

```shell script
cd ../stable-coin-proto-js
# compile
yarn
# create a link for other projects
yarn link
```

### JavaScript SDK - `stable-coin-sdk-js'

SDK for use by the client and admin user interfaces

#### Build stable-coin-sdk-js

```shell script
cd ../stable-coin-sdk-js
# link to stable-coin-proto-js
yarn link "@stable-coin/proto"
# compile
yarn
# create a link for other projects
yarn link
```

### Client — `stable-coin-client`

Sample implementation of a client on top of the platform **and** network.

#### Build stable-coin-client

```shell script
cd ../stable-coin-client
# link to stable-coin-sdk-js
yarn link "@stable-coin/sdk"
# compile
yarn
```

#### Setup environment for stable-coin-client

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

**List of appnet node end points for the clients**

- VUE_APP_APP_NET_NODES=[{"address": "localhost:8080"}]

**Ethereum Contract Address**

- VUE_APP_ETH_CONTRACT_ADDRESS="0x125b7195212f40faD937444C29D99eA4990E88f1"

#### Run stable-coin-client

_Choose the port you wish to run the client on in the command below_

```shell script
yarn serve --port 8082
```

### Admin — `stable-coin-admin`

Sample implementation of an administration portal on top of the platform **and** network.

```shell script
cd ../stable-coin-admin
# link to stable-coin-sdk-js
yarn link "@stable-coin/sdk"
# compile
yarn
```

#### Setup environment for stable-coin-admin

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

- VUE_APP_APP_NET_NODES=[{"name": "Node 1", "address": "localhost:8080","left": "230px", "top": "150px"}]

** Ethereum Contract Address**

VUE_APP_ETH_CONTRACT_ADDRESS="0x125b7195212f40faD937444C29D99eA4990E88f1"

#### Run stable-coin-admin

_Choose the port you wish to run the client on in the command below_

```shell script
yarn serve --port 8083
```

## Manual Install prerequisites

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

## Developing further

If you make changes to the database schema, you'll need to rebuild the automatically generated code.

```shell
# Set environment variables
export HSC_DATABASE_URL="postgresql://localhost:5432/"
export HSC_POSTGRES_DB="stable_coin"
export HSC_DATABASE_USERNAME="postgres"
export HSC_DATABASE_PASSWORD="password"

# Create / update entities in the database
./gradlew flywayMigrate

# Build java artifacts
./gradlew jooqGenerate
```

## License

Licensed under Apache License,
Version 2.0 – see [LICENSE](LICENSE) in this repo
or [apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0).
