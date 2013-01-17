<?php

namespace Zeega\DataBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Zeega\DataBundle\Entity\Sequence
 */
class Sequence
{
    /**
     * @var integer $id
     */
    private $id;

    /**
     * @var string $title
     */
    private $title;

    /**
     * @var array $attr
     */
    private $attr;

    /**
     * @var Zeega\DataBundle\Entity\Project
     */
    private $project;

    /**
     * @var Zeega\DataBundle\Entity\Layer
     */
    private $layers;

    public function __construct()
    {
        $this->layers = new \Doctrine\Common\Collections\ArrayCollection();
    }
    
    /**
     * Get id
     *
     * @return integer 
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set title
     *
     * @param string $title
     */
    public function setTitle($title)
    {
        $this->title = $title;
    }

    /**
     * Get title
     *
     * @return string 
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * Set attr
     *
     * @param array $attr
     */
    public function setAttr($attr)
    {
        $this->attr = $attr;
    }

    /**
     * Get attr
     *
     * @return array 
     */
    public function getAttr()
    {
        return $this->attr;
    }

    /**
     * Set project
     *
     * @param Zeega\DataBundle\Entity\Project $project
     */
    public function setProject(\Zeega\DataBundle\Entity\Project $project)
    {
        $this->project = $project;
    }

    /**
     * Get project
     *
     * @return Zeega\DataBundle\Entity\Project 
     */
    public function getProject()
    {
        return $this->project;
    }

    /**
     * Add layers
     *
     * @param Zeega\DataBundle\Entity\Layer $layers
     */
    public function addLayer(\Zeega\DataBundle\Entity\Layer $layers)
    {
        $this->layers[] = $layers;
    }

    /**
     * Get layers
     *
     * @return Doctrine\Common\Collections\Collection 
     */
    public function getLayers()
    {
        return $this->layers;
    }
    /**
     * @var integer $project_id
     */
    private $project_id;

    /**
     * @var boolean $enabled
     */
    private $enabled;

    /**
     * @var array $persistent_layers
     */
    private $persistent_layers;

    /**
     * @var string $description
     */
    private $description;

    /**
     * @var integer $advance_to
     */
    private $advance_to;


    /**
     * Set project_id
     *
     * @param integer $projectId
     * @return Sequence
     */
    public function setProjectId($projectId)
    {
        $this->project_id = $projectId;
    
        return $this;
    }

    /**
     * Get project_id
     *
     * @return integer 
     */
    public function getProjectId()
    {
        return $this->project_id;
    }

    /**
     * Set enabled
     *
     * @param boolean $enabled
     * @return Sequence
     */
    public function setEnabled($enabled)
    {
        $this->enabled = $enabled;
    
        return $this;
    }

    /**
     * Get enabled
     *
     * @return boolean 
     */
    public function getEnabled()
    {
        return $this->enabled;
    }

    /**
     * Set persistent_layers
     *
     * @param array $persistentLayers
     * @return Sequence
     */
    public function setPersistentLayers($persistentLayers)
    {
        $this->persistent_layers = $persistentLayers;
    
        return $this;
    }

    /**
     * Get persistent_layers
     *
     * @return array 
     */
    public function getPersistentLayers()
    {
        return $this->persistent_layers;
    }

    /**
     * Set description
     *
     * @param string $description
     * @return Sequence
     */
    public function setDescription($description)
    {
        $this->description = $description;
    
        return $this;
    }

    /**
     * Get description
     *
     * @return string 
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * Set advance_to
     *
     * @param integer $advanceTo
     * @return Sequence
     */
    public function setAdvanceTo($advanceTo)
    {
        $this->advance_to = $advanceTo;
    
        return $this;
    }

    /**
     * Get advance_to
     *
     * @return integer 
     */
    public function getAdvanceTo()
    {
        return $this->advance_to;
    }
}