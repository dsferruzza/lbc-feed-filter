<?php

// This script act as a proxy, because leboncoin.fr is unreachable from some networks/IPs (OVH, ...)
// It is secured by a key so it is not public, and it can only fetch URLs starting by "http://www.leboncoin.fr"
// It is only used to fetch public pages, not to perform any illegal activity/attack (it only make GET requests)

$key = trim(file_get_contents('key.txt'));

if (!empty($_GET['key']) && $_GET['key'] == $key &&
	!empty($_GET['url']) && substr($_GET['url'], 0, 23) == 'http://www.leboncoin.fr') {
	readfile($_GET['url']);
}
