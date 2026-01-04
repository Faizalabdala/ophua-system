#!/bin/bash
set -e

# Configurar pg_hba para aceitar conexões de qualquer host
echo "host all all 0.0.0.0/0 md5" >> /var/lib/postgresql/data/pg_hba.conf
echo "host all all ::/0 md5" >> /var/lib/postgresql/data/pg_hba.conf

# Reiniciar PostgreSQL para aplicar configurações
pg_ctl reload
