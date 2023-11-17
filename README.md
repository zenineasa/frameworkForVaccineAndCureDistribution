# A Framework for COVID-19 Cure or Vaccine distribution Modeling, Analysis and Decision Making

## About the project

The entire world has been affected by the outbreak of COVID-19. We need to come up with a good strategy to distribute vaccines and/or medicines in such a way that casualty is minimized. We can agree that different kinds of decisions need to be taken in different areas of the world when limited number of medicines and/or vaccines are made available to them. The administration of different regions need to plan resource allocation and distribution effectively. We propose an Agent Based modeling framework for disease spread modeling that is capable of generating people as agents with various attributes such as mobility, infected, immune, etc. and an environment having different borders or boundaries which the agents may or may not cross according to probability specified during modeling. The environment also incorporates tweaking of parameters related to transmission probability, disease spread radius, period taken for a person to get cured and probability of getting killed due to the disease. Parameters related to a certain Governmental decisions as to implementing a lockdown in certain areas when a threshold of cases are observed is also incorporated. Additionally, parameters related to the point at which vaccine or medicine becomes available and the quantity of vaccine or medicine that is available in bulk and the frequency at which such bulks arrive may also be tweaked. The framework may be tweaked to model and make decision on any future epidemic or pandemic.

Have a look at my blog post regarding the same:
http://www.buddygo.net/2021/05/regarding-covid-19-related-project-that.html

## Running the simulation:
1. Host a simple HTTPServer using python
    For Windows:
        python -m http.server
    For linux (tried with Ubuntu):
        python -m SimpleHTTPServer
2. Open http://localhost:8000 on Chrome.

## Map
The file 'data.json' contains information regarding the layout of the map. You can define boundaries, population centers and radius, infected people, mobility factor, etc.

## Using 'boundaryGenerationScript.js'
Run the following command in your terminal or command prompt to generate 'honeycomb.json' in accordance with what we have in the aforementioned script. Note that you need 'NodeJS' installed for the following command to work.
    node boundaryGenerationScript.js

## Troubleshoot
If you feel like certain edit didn't work, perhaps clearing the cache and hard reloading may help.

## Interesting fact
While generating the boundaries, you may observe slight color variation for boundaries oriented at different angles. The information regarding the orientation of a boundary as well as the value of permeability of the boundary is embedded in the value of its color. The R and G values of the color are respectively used to represent Permeability and Angular orientation of the boundaries respectively.

For more information, have a look at the functions 'getBoundaryColor' and 'getBoundaryValueAt' functions.

## Citation

A lot of time and effort has been put into working on this project, writing the report and ensuring that the code is readable enough. Therefore, it would be lovely if you would cite us using the following.

```
@misc{panthakkalakath2023framework,
      title={A Framework for Modeling, Analyzing, and Decision-Making in Disease Spread Dynamics and Medicine/Vaccine Distribution}, 
      author={Zenin Easa Panthakkalakath and Neeraj and Jimson Mathew},
      year={2023},
      eprint={2311.09984},
      archivePrefix={arXiv},
      primaryClass={cs.MA}
}
```
You can read the corresponding paper at [https://arxiv.org/abs/2311.09984](https://arxiv.org/abs/2311.09984).

