<?php
// test_email.php
// Upload this file to your Hostinger public_html folder and access it via browser: yoursite.com/test_email.php

header("Content-Type: text/plain");

echo "1. Script Access: OK\n";
echo "2. Checking PHP Version: " . phpversion() . "\n";

// CHANGE THIS TO YOUR EMAIL
$to = "contact@jcll.me";
$subject = "Connectivity Test: PHP Mail";
$message = "If you are reading this, PHP mail() is working correctly on your Hostinger server.";
$headers = "From: no-reply@test.com";

echo "3. Attempting to send email to '$to'...\n";

if ($to === "INSERT_YOUR_EMAIL_HERE") {
    echo "ERROR: You must edit this file (test_email.php) and set a valid email address in the \$to variable before testing.\n";
    exit;
}

try {
    $result = mail($to, $subject, $message, $headers);

    if ($result) {
        echo "4. Result: SUCCESS. Mail function returned true.\n";
        echo "   Check your specific inbox (and spam folder) for the message.\n";
    } else {
        echo "4. Result: FAILURE. Mail function returned false.\n";
        echo "   This usually means the server is not configured to send emails.\n";
        echo "   Please contact Hostinger support.\n";
    }
} catch (Exception $e) {
    echo "4. Result: EXCEPTION.\n";
    echo "   Error: " . $e->getMessage() . "\n";
}
?>