# 작심삼일 — Android 플래너

3일 단위로 루틴과 날짜별 계획을 관리하는 갤럭시용 앱입니다.

## 구현한 기능

- 첫 시작일을 선택하면 연속된 3일과 다음 회차 날짜 자동 지정.
- 이번 3일 루틴: 추가·수정·삭제, 날짜별 완료 체크, 접기·펼치기.
- 1·2·3일차 계획: 추가·수정·삭제·완료 체크, 독립적인 접기·펼치기.
- 이전·다음 회차 이동 및 미래 계획 미리 작성.
- 새 회차 루틴은 직전 작성 회차에서 독립적으로 복사하고 체크 초기화.
- 날짜별 계획은 새 회차에서 빈 상태로 시작.
- 기기 내부 자동 저장 및 인터넷 없이 사용. 인터넷 권한도 요청하지 않습니다.
- 메뉴 → 오늘부터 리셋: 확인 후 오늘을 새 1일차로 지정하고 빈 계획 시작.
- 리셋 이전의 과거·미래 회차는 삭제하지 않고 읽기 전용 기록으로 보관.
- 작은 화면에서 전체 세로 스크롤, 밝은/어두운 화면 자동 대응.

## GitHub에서 APK 만들기

### 1. 저장소 생성

GitHub에 로그인하고 새 저장소를 만듭니다. 이름 예: `three-day-planner`.
웹 업로드를 쉽게 하려면 생성 시 **Add a README file**을 체크합니다.

### 2. 소스 업로드

이 프로젝트의 **내용물**을 저장소 루트에 올립니다. `three-day-planner` 상위 폴더 자체를 한 겹 더 올리지 마세요.

저장소 첫 화면에서 아래 파일·폴더가 보여야 합니다.

- `settings.gradle`
- `build.gradle`
- `gradle.properties`
- `app/`
- `signing/`
- `.github/workflows/build-apk.yml`
- `tests/`

Mac Finder에서 `.github`가 보이지 않으면 `Command + Shift + .`로 숨김 파일을 표시합니다.
GitHub 웹의 **Add file → Upload files**에 프로젝트 내용물을 드래그해 올리고 커밋합니다.
`.github` 업로드가 빠졌다면 **Add file → Create new file**로 `.github/workflows/build-apk.yml`을 만들고 같은 경로 파일의 내용을 붙여 넣습니다.

### 3. 빌드 실행

- `main` 또는 `master`에 커밋하면 자동으로 빌드합니다.
- 수동 실행: **Actions → Build Android APK → Run workflow**.
- 처음에는 GitHub Actions 사용을 활성화해야 할 수 있습니다.
- 성공한 실행 하단 **Artifacts → three-day-planner-apk**를 내려받습니다.
- 내려받은 ZIP을 풀면 `app-debug.apk`가 있습니다.

### 4. 갤럭시에 설치

APK를 갤럭시로 옮겨 열고, 사용하는 파일 앱에 ‘출처를 알 수 없는 앱 설치’를 허용한 뒤 설치합니다.
기기에 따라 자동 차단 설정이 설치를 제한할 수 있습니다.

## 업데이트와 서명

개인 테스트용 debug APK를 빌드합니다. 프로젝트에 포함한 **공개 개발용 서명 키**를 계속 사용하므로 같은 소스로 다시 빌드한 APK를 기존 앱 위에 업데이트할 수 있습니다. 이 키의 암호는 `android`이며 비밀이 아닙니다. 정식 배포나 Play Store 제출용 서명으로 사용하지 마세요.

- `signing/development.keystore`는 재생성하지 말고 유지합니다.
- 앱 삭제 또는 앱 데이터 삭제 시 저장 기록도 지워집니다. 이 버전에는 백업·동기화가 없습니다.
- 공개 배포가 필요해지면 개인 release 키와 GitHub Secrets를 사용하는 별도 릴리스 구성을 추가하세요.

## 구현 구조

- Android Java Activity가 앱에 포함된 HTML/CSS/JavaScript를 WebView로 실행합니다.
- 외부 웹사이트를 여는 앱이 아니며 화면과 로직이 APK 안에 포함됩니다.
- `https://planner.local/`은 앱 내부 자산을 제공하는 가상 주소입니다. 외부 서버에 연결하지 않습니다.
- 데이터는 앱 WebView의 localStorage에 저장합니다.
- 최소 Android 8.0(API 26), compile/target SDK 35.
- JDK 17, Gradle 8.11.1, Android Gradle Plugin 8.9.2.
- Gradle Wrapper 대신 Actions의 `setup-gradle`로 고정 버전 Gradle을 설치합니다.

## 개발 환경에서 실행

Android Studio로 이 폴더를 열거나, JDK 17·Android SDK 35·Gradle 8.11.1 설치 후:

```sh
gradle :app:assembleDebug :app:lintDebug
```

화면만 브라우저에서 확인하려면:

```sh
python3 -m http.server 8080 --directory app/src/main/assets
```

브라우저에서 `http://localhost:8080`을 엽니다. 브라우저 저장 데이터와 설치 앱의 데이터는 서로 다릅니다.

## 검증

```sh
npm ci --ignore-scripts
node --test tests/*.test.cjs
node --check app/src/main/assets/app.js
```

로직 테스트는 회차 경계, 월·연도·윤년, 루틴 복사의 독립성, 미접속 후 회차 계산, 리셋 기록 보존, 저장 형식을 확인합니다.
DOM 화면 동작 테스트도 추가·수정·삭제·완료 체크·루틴 복사·리셋·취소·보관 기록을 확인합니다. 이 검사는 레이아웃 렌더링이나 Android 실기기 검증을 대신하지 않습니다.
GitHub Actions가 APK 조립과 Android Lint를 실행합니다. 최초 빌드 성공 여부는 Actions에서 확인해야 합니다.

## 이번 구현에서 선택한 미정 사항

데이터 손실을 피하도록 리셋 시 과거와 미래 계획을 기록으로 보관합니다. 리셋 후 회차 번호는 1부터 시작합니다. 기본 메뉴 안에 리셋을 배치했습니다.

알림, 백업·복원, 클라우드 동기화, 삭제 되돌리기, 미완료 항목 가져오기는 이 버전에 포함하지 않았습니다.
