FROM timescale/timescaledb:1.7.4-pg12
# Adjust PostgreSQL configuration so that remote connections to the
# database are possible.
RUN echo "host all  all    0.0.0.0/0  md5" >> /var/lib/postgresql/data/pg_hba.conf

# And add ``listen_addresses`` to ``/var/lib/postgresql/data/postgresql.conf``
RUN echo "listen_addresses='*'" >> /var/lib/postgresql/data/postgresql.conf

COPY initdb.sh /docker-entrypoint-initdb.d/initdb.sh
EXPOSE 5432
