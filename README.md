# Color Wheel Entities Card by [@mheirendt](https://www.github.com/mheirendt)

A lovelace plugin for home assistant. Take control of the color of multiple entities with ease.

[![GitHub Release][releases-shield]][releases]
[![License][license-shield]](LICENSE.md)
[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg?style=for-the-badge)](https://github.com/custom-components/hacs)

![Project Maintenance][maintenance-shield]
[![GitHub Activity][commits-shield]][commits]

## Options

| Name              | Type    | Requirement  | Description                                 | Default                           |
| ----------------- | ------- | ------------ | ------------------------------------------- | --------------------------------- |
| type              | string  | **Required** | `custom:color-wheel-row`          |                                   |
| show_error        | boolean | **Optional** | Show what an error looks like for the card  | `false`                           |
| show_warning      | boolean | **Optional** | Show what a warning looks like for the card | `false`                           |
| entities          | array   | **Required** | Entities to be controlled by the wheel      | `none`                            |

[commits-shield]: https://img.shields.io/github/commit-activity/y/mheirendt/color-wheel-row.svg?style=for-the-badge
[commits]: https://github.com/mheirendt/color-wheel-row/commits/master
[devcontainer]: https://code.visualstudio.com/docs/remote/containers
[forum]: https://community.home-assistant.io/c/projects/frontend
[license-shield]: https://img.shields.io/github/license/mheirendt/color-wheel-row.svg?style=for-the-badge
[maintenance-shield]: https://img.shields.io/maintenance/yes/2020.svg?style=for-the-badge
[releases-shield]: https://img.shields.io/github/release/mheirendt/color-wheel-row.svg?style=for-the-badge
[releases]: https://github.com/mheirendt/color-wheel-row/releases
