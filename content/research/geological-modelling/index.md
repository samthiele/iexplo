---
image: cover.png
title: Geological modelling
subtitle: Neural-field models that update with new mine and outcrop data
order: 7
projects:
  - curlew
  - digit
---

Geological models have to honour sparse, mixed observations — contacts, orientations, borehole intervals, mine-face maps — and a history of folding, faulting, unconformities and intrusion. We treat that history as a graph of events whose geometry is carried by implicit fields, so structures can be built in geological order and updated when new data arrive.

**curlew** implements this as differentiable neural and analytical fields in Python. The same framework interpolates real constraints or replaces the fields with simple functions to synthesise geology for testing and inversion. **DigIT** takes those ideas into near-mine exploration: self-updating common-earth models that absorb hyperspectral mine-face maps, coupled with physical-chemical simulation of ore-forming processes so that new exposures feed deposit-scale targets rather than being lost to production.

The aim is models that stay current with mapping, remain reusable across software, and support targeting next to active and historic mines.
