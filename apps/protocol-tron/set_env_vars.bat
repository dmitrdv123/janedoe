@echo off
SETLOCAL EnableDelayedExpansion

REM Load environment variables from .env.local file
for /f "delims=" %%a in ('type .env.%NODE_ENV%') do (
    set "var=%%a"
    if not "!var:~0,1!"=="#" (
        set "var=!var: =!"
        for /f "tokens=1* delims==" %%b in ("!var!") do (
            set "key=%%b"
            set "value=%%c"
            set "!key!=!value!"
        )
    )
)

REM Display the environment variables (for debugging purposes)
echo SIGNER=!SIGNER!
echo TRON_NATIVE_NAME=!TRON_NATIVE_NAME!
echo TRON_NATIVE_SYMBOL=!TRON_NATIVE_SYMBOL!
echo TRON_NATIVE_DECIMALS=!TRON_NATIVE_DECIMALS!

ENDLOCAL
