@echo off
setlocal

set "PROJECT_DIR=%~dp0."
set "PHP_EXE=C:\xampp\php\php.exe"
set "MYSQL_MARIADBD=C:\xampp\mysql\bin\mariadbd.exe"
set "MYSQL_MYSQLD=C:\xampp\mysql\bin\mysqld.exe"
set "MYSQL_CLIENT=C:\xampp\mysql\bin\mysql.exe"
set "MYSQL_INI=C:\xampp\mysql\bin\my.ini"
set "MYSQL_INI_ALT=C:\xampp\mysql\my.ini"
set "DB_SCHEMA=%PROJECT_DIR%\Backend\database.sql"
set "APP_PORT=8000"
set "DB_PORT=3306"
set "APP_URL=http://localhost:%APP_PORT%/Frontend/index.html"
set "NO_PAUSE="
set "NO_OPEN="

:parse_args
if "%~1"=="" goto args_done
if /I "%~1"=="/silent" set "NO_PAUSE=1"
if /I "%~1"=="/noopen" set "NO_OPEN=1"
shift
goto parse_args
:args_done

cd /d "%PROJECT_DIR%"

echo =========================================
echo    Starting Ghar Sewa Automatically
echo =========================================
echo.

if not exist "%PHP_EXE%" (
    echo Error: PHP was not found at "%PHP_EXE%".
    echo Install XAMPP or update PHP_EXE in this file.
    if not defined NO_PAUSE pause
    exit /b 1
)

if exist "%MYSQL_MARIADBD%" (
    set "MYSQL_EXE=%MYSQL_MARIADBD%"
) else if exist "%MYSQL_MYSQLD%" (
    set "MYSQL_EXE=%MYSQL_MYSQLD%"
) else (
    echo Error: MariaDB/MySQL was not found in the XAMPP folder.
    echo Expected "%MYSQL_MARIADBD%" or "%MYSQL_MYSQLD%".
    echo Install XAMPP or update MYSQL_MARIADBD / MYSQL_MYSQLD in this file.
    if not defined NO_PAUSE pause
    exit /b 1
)

if not exist "%MYSQL_INI%" (
    if exist "%MYSQL_INI_ALT%" (
        set "MYSQL_INI=%MYSQL_INI_ALT%"
    ) else (
        echo Error: MariaDB config was not found at "%MYSQL_INI%" or "%MYSQL_INI_ALT%".
        if not defined NO_PAUSE pause
        exit /b 1
    )
)

call :port_open %DB_PORT%
if errorlevel 1 (
    echo Starting MariaDB on port %DB_PORT%...
    start "Ghar Sewa MariaDB" /min "%MYSQL_EXE%" --defaults-file="%MYSQL_INI%" --standalone
    echo Waiting for MariaDB...
    call :wait_for_port %DB_PORT% 30
    if errorlevel 1 (
        echo.
        echo Error: MariaDB did not start on port %DB_PORT%.
        echo Open XAMPP Control Panel and check whether MySQL can start there.
        if not defined NO_PAUSE pause
        exit /b 1
    )
) else (
    echo MariaDB is already running on port %DB_PORT%.
)

if exist "%MYSQL_CLIENT%" if exist "%DB_SCHEMA%" (
    echo Making sure the Ghar Sewa database exists...
    "%MYSQL_CLIENT%" -u root < "%DB_SCHEMA%" >nul 2>nul
)

call :port_open %APP_PORT%
if errorlevel 1 (
    echo Starting PHP server on port %APP_PORT%...
    start "Ghar Sewa PHP Server" /min "%PHP_EXE%" -S localhost:%APP_PORT% -t "%PROJECT_DIR%"
    echo Waiting for PHP...
    call :wait_for_port %APP_PORT% 15
    if errorlevel 1 (
        echo.
        echo Error: PHP server did not start on port %APP_PORT%.
        if not defined NO_PAUSE pause
        exit /b 1
    )
) else (
    echo PHP server is already running on port %APP_PORT%.
)

if not defined NO_OPEN (
    echo.
    echo Opening Ghar Sewa...
    start "" "%APP_URL%"
)
echo.
echo Ghar Sewa is running at:
echo %APP_URL%
echo.
if defined NO_PAUSE (
    echo Close the minimized server windows when you are done.
) else (
    echo You can keep this window open while using the app.
    echo Close the two minimized server windows when you are done.
)
echo.
if not defined NO_PAUSE pause
exit /b 0

:port_open
netstat -ano | findstr /R /C:":%~1 .*LISTENING" >nul
exit /b %ERRORLEVEL%

:wait_for_port
setlocal
set "WAIT_PORT=%~1"
set "WAIT_SECONDS=%~2"
set /a WAIT_COUNT=0
:wait_loop
netstat -ano | findstr /R /C:":%WAIT_PORT% .*LISTENING" >nul
if not errorlevel 1 (
    endlocal & exit /b 0
)
if %WAIT_COUNT% GEQ %WAIT_SECONDS% (
    endlocal & exit /b 1
)
set /a WAIT_COUNT+=1
ping -n 2 127.0.0.1 >nul
goto wait_loop
