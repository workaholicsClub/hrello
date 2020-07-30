#FROM alpine
#ADD https://raw.githubusercontent.com/dagwieers/unoconv/master/unoconv /usr/bin/unoconv
#RUN chmod +xr /usr/bin/unoconv
#RUN apk add --no-cache libreoffice

#RUN chmod +xr /usr/bin/unoconv && \
#    sed -i 's/env python$/env python3/' /usr/bin/unoconv

FROM ubuntu
ENV DEBIAN_FRONTEND noninteractive

RUN apt-get -qq -y update \
    && apt-get -q -y dist-upgrade \
    && apt-get -q -y install locales libreoffice libreoffice-writer psmisc curl \
        libreoffice-impress libreoffice-common fonts-opensymbol python3-pip \
        python3-uno python3-lxml python3-icu unoconv \
    && apt-get -qq -y autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
    && localedef -i ru_RU -c -f UTF-8 -A /usr/share/locale/locale.alias ru_RU.UTF-8

ENV LANG='ru_RU.UTF-8'