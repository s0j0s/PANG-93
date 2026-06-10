# AGENTS.md

AI 에이전트(Claude Code 등)가 이 저장소에서 작업할 때 참고하는 문서 인덱스.

---

## 기획 문서

| 파일 | 설명 |
|------|------|
| [docs/PRD.md](docs/PRD.md) | 팡(PANG) 원작 게임 조사 내용 — 기술 스택, 풍선 시스템, 무기, 파워업, 스테이지 구성 전반 |
| [docs/PLAN.md](docs/PLAN.md) | Phase 별 구현 목표를 정의한 개발 계획 문서 |

## 기능 명세 (docs/FEATURES/)

| 파일 | 설명 |
|------|------|
| [docs/FEATURES/main.md](docs/FEATURES/main.md) | 첫 메인 화면 구성 — 메뉴 항목, 레이아웃, 진입 흐름 |
| [docs/FEATURES/game_rule.md](docs/FEATURES/game_rule.md) | 게임 룰 상세 — 풍선 분열 시스템, 조작, 무기, 파워업, 점수, 라이프, 클리어 조건 |
| [docs/FEATURES/mission1.md](docs/FEATURES/mission1.md) | Mission 1 난이도 및 규칙 — 후지산 배경, 스테이지별 풍선 구성, 난이도 설계 방향 |

---

## 작업 규칙

- 새로운 기능 명세 파일을 추가할 경우 이 파일의 **기능 명세** 테이블에 반드시 등록
- 구현 계획이나 태스크는 이 파일이 아닌 대화 컨텍스트 또는 별도 태스크 도구로 관리
