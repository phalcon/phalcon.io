<?php


$repos = [
    'cphalcon',
    'docs-app',
    'zephir',
    'vokuro',
    'devtools',
    'phalcon.io'
];

$template = 'https://api.github.com/repos/phalcon/%s/contributors';
$final = [];

foreach ($repos as $repo) {
    $ch = curl_init(sprintf($template, $repo));
    echo $repo . PHP_EOL;
    curl_setopt(
        $ch,
        CURLOPT_HTTPHEADER,
        [
            'Accept: application/vnd.github.v3+json',
            'User-Agent: GitHub-username'
        ]
    );

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $json = curl_exec($ch);
    curl_close($ch);

    $data   = json_decode($json, true);

    foreach ($data as $contributor) {
        if (isset($contributor['login'])) {
            $username = $contributor['login'];
            $total    = $final[$username]['total'] ?? 0;
            $total    = $total + $contributor['contributions'];

            $final[$username]['username'] = $username;
            $final[$username]['url']      = $contributor['url'];
            $final[$username]['avatar']   = $contributor['avatar_url'];
            $final[$username]['total']    = $total;
        }
    }
}

$columns = array_column($final, 'total');
array_multisort($columns, SORT_DESC, $final);

$count       = 1;
$reallyFinal = [];
foreach ($final as $item) {
    if ($count > 60) {
        break;
    }
    $reallyFinal[] = $item['username'];
    $username = $item['username'];
    $url      = $item['avatar'];
    $ch = curl_init ($url);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_BINARYTRANSFER,1);
    $raw = curl_exec($ch);
    curl_close ($ch);

    $location = './assets/images/contributors/' . $username . '.jpg';
    if (true === file_exists($location)){
        unlink($location);
    }
    $fp = fopen($location,'x');
    fwrite($fp, $raw);
    fclose($fp);
    echo $username . PHP_EOL;
    $count++;
}

file_put_contents('_data/contributors.json', json_encode($reallyFinal, JSON_PRETTY_PRINT));