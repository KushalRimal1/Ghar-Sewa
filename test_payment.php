<?php
$input = [
    'action' => 'pay',
    'requestId' => 1,
    'amount' => 500,
    'notes' => 'Test'
];
$_REQUEST['action'] = 'pay';
$json = json_encode($input);
file_put_contents('php://memory', $json);

// But we can't mock php://input easily without creating a wrapper or just directly executing it.
