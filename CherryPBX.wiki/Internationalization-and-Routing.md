# Internationalization and Routing

## English

### Supported Locales

The current locale configuration is:

- `en`
- `zh`

The default locale is `zh`.

### Key Files

- `i18n/config.ts`
- `i18n/request.ts`
- `navigation.ts`
- `messages/en.json`
- `messages/zh.json`

### Routing Model

Internally, the app uses an App Router segment at `app/[locale]/...`.

At the navigation layer, `next-intl` is configured with:

```ts
localePrefix: "never"
```

This means locale-aware routing exists inside the application, but public URLs are not exposed with a visible locale prefix.

### Translation Loading

The project uses `next-intl` and loads dictionaries from `messages/*.json`.

### Practical Result

- pages remain locale-aware
- translations stay separate from page logic
- locale config is centralized
- navigation helpers can resolve localized routes without changing the public URL shape

## 中文

### 当前支持语言

当前语言配置为：

- `en`
- `zh`

默认语言是 `zh`。

### 关键文件

- `i18n/config.ts`
- `i18n/request.ts`
- `navigation.ts`
- `messages/en.json`
- `messages/zh.json`

### 路由模型

应用内部通过 `app/[locale]/...` 这个 App Router 路由段承载语言上下文。

在导航层，`next-intl` 当前配置为：

```ts
localePrefix: "never"
```

这意味着应用内部具备语言感知路由，但对外公开 URL 不显示语言前缀。

### 翻译加载方式

项目使用 `next-intl`，从 `messages/*.json` 加载翻译字典。

### 实际效果

- 页面天然具备 locale 语义
- 文案和页面逻辑分离
- 语言配置集中在少量基础文件中
- 导航辅助可以处理语言差异，而不改变公开 URL 结构
