<?php
$_SERVER['REQUEST_METHOD'] = 'POST';
$_GET['action'] = 'pay';
$input = [
    'action' => 'pay',
    'requestId' => 1,
    'amount' => 500,
    'notes' => 'Test'
];
$json = json_encode($input);
// overwrite file_get_contents by using a mock
// well, we can't easily mock file_get_contents('php://input')
// Let me just create a wrapper!
$wrapper = "<?php \$input = json_decode('$json', true); ?>";
// Actually I'll just change payment.php temporarily to debug if it's the issue.
