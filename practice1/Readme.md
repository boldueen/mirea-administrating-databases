initialize mongo database

```bash
docker compose exec -T mongo /bin/bash -c 'mongosh -u user -p pass' < mongo-init.js
```