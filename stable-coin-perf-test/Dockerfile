FROM python:3.8.5
COPY . /srv/stablecoin
RUN pip install -r /srv/stablecoin/requirements.txt
EXPOSE 5557 5558 8089
RUN chmod 755 /srv/stablecoin/run.sh
WORKDIR /srv/stablecoin
ENTRYPOINT ["/srv/stablecoin/run.sh"]
