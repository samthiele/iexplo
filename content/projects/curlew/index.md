---
title: curlew neural field modelling
years: ongoing
funding: Open-source software
research: [learning, outcrop-mapping, geological-modelling]
---

**curlew** is an open-source Python toolkit for 2- and 3-dimensional geological models built with neural fields. Diverse geological data can be included in a graph-based framework so that unconformities, folds, faults and intrusions are constructed in geological-history order.

The same framework also builds synthetic geology, replacing neural fields with simple mathematical functions that can be sampled for testing and algorithm development. Everything is implemented in a differentiable way with PyTorch, so the models can sit inside inversion and optimisation workflows.

Source and docs: [github.com/samthiele/curlew](https://github.com/samthiele/curlew). The method is described by Kamath, Thiele and others (2026), *Curlew 1.0: Spatio-temporal implicit geological modelling with neural fields in python*, [Solid Earth](https://doi.org/10.31223/X5KX81).
