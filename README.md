## Masakapahariini Api 🧙 🍳
---

Food recipes api bahasa Indonesia 🇮🇩 build with __Cheerio__ and __Node js__ 🌸

---
**Status** : On Progress

### Documentation
---

| Field | Description |
| ------ | ----------- |
| key   | is a unique key used to access the next endpoint example  ```key : 'resep-sambal-teri-petai'``` |
| page | load a next of data |
| tag    | is unique key of a article category to hit a detail of article|



### Endpoint Usage
---
**Base Url** : `https://masak-apa.tomorisakura.vercel.app`

* `new-recipes` done
```
/api/recipes
```
* `new-recipes-by-page` done

```
/api/recipes/:page
```

* `recipes-by-category` done

```
/api/categorys/recipes/:key
```

* `recipes-category` done

```
/api/categorys/recipes
```

* `recipes-detail` done

```
/api/recipe/:key
```

* `search-recipes` done

```
/api/search/?q=parameter
```

- __example__

```
/api/search/?q=tahu
```

* `article-category` done

```
/api/categorys/article
```

* `article-by-category` done

```
/api/categorys/article/:key
```

- __example__

```
/api/categorys/article/makanan-gaya-hidup
```

* `article` done

```
/api/articles/new
```

* `article-details` done

```
/api/article/:tag/:key
```

- __example__

```
/api/article/makanan-gaya-hidup/papeda-dan-masakan-indonesia-timur
```

---


#### Credits
Copyright © 2020 Resky Arianto

Build With 💙