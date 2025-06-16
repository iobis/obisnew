---
layout: default
title: Projects
permalink: /projects/
---

<div class="container mt-4">
    <div class="row">
        <div class="col-12">
            <h1>Projects</h1>
            <div class="row">
                {% assign project_pages = site.pages | where: "layout", "project" | sort: "title" %}
                {% for project in project_pages %}
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">{{ project.title }}</h5>
                            {% if project.description %}
                            <p class="card-text">{{ project.description }}</p>
                            {% endif %}
                            <a href="{{ project.url | relative_url }}" class="btn btn-primary">Learn More</a>
                            {% if project.website %}
                            <a href="{{ project.website }}" class="btn btn-outline-primary" target="_blank">Visit Website</a>
                            {% endif %}
                        </div>
                    </div>
                </div>
                {% endfor %}
            </div>
        </div>
    </div>
</div> 