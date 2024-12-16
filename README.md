# Avicenne Referral Module

A dynamic NestJS module that generates unique referral codes based on a project key. This module ensures that each project can generate distinct referral codes by using the project's name (provided as a key) in the initialization. It supports encoding, decoding, and validating referral codes, and skips codes containing banned words.

## Features

- **Dynamic Referral Code Generation**: Generate unique referral codes for different projects.
- **Customizable**: Use the project name (key) to generate different codes across multiple projects.
- **Supports Banned Words**: Automatically skips referral codes that contain banned words.
- **GCD-based Generator**: Uses a generator that ensures codes are unique and non-repetitive across projects.
- **Offset Calculation**: The `initialOffset` is dynamically derived from the project name to ensure uniqueness.