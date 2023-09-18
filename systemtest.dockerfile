FROM node:latest
# Sadly, we cannot use the prebuilt cypress images, as they run on Debian 11 and we need Debian 12 to run Grafana
WORKDIR /teamscale-javascript-profiler
RUN apt update
RUN apt install time sudo
RUN apt install netcat-traditional -y
RUN npm install cypress@9.5.1
RUN apt-get install -y wget libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb unzip
RUN wget https://go.dev/dl/go1.20.7.linux-amd64.tar.gz
RUN tar -C /usr/local -xzf go1.20.7.linux-amd64.tar.gz
ENV PATH="/usr/local/go/bin:${PATH}"
RUN apt-get install gnupg wget -y && \
    wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
    apt-get update && \
    apt-get install google-chrome-stable -y --no-install-recommends && \
    rm -rf /var/lib/apt/lists/* \
RUN apt-get install git
RUN npm install -g pnpm