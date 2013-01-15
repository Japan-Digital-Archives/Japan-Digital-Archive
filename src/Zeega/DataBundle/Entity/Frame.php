<?php

namespace Zeega\DataBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Zeega\DataBundle\Entity\Frame
 */
class Frame
{
    /**
     * @var integer $id
     */
    private $id;

    /**
     * @var integer $sequence_index
     */
    private $sequence_index;

    /**
     * @var array $layers
     */
    private $layers;

    /**
     * @var array $attr
     */
    private $attr;

    /**
     * @var string $thumb_url
     */
    private $thumb_url;

    /**
     * @var Zeega\DataBundle\Entity\Sequence
     */
    private $sequence;

    /**
     * @var Zeega\DataBundle\Entity\Frame
     */
    private $link_up;

    /**
     * @var Zeega\DataBundle\Entity\Frame
     */
    private $link_down;

    /**
     * @var Zeega\DataBundle\Entity\Frame
     */
    private $link_left;

    /**
     * @var Zeega\DataBundle\Entity\Frame
     */
    private $link_right;
	
	public function __construct()
	{
		$this->created_at = new \DateTime();
		$this->thumb_url = "http://mlhplayground.org/gamma-james/images/thumb.png";
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
     * Set sequence_index
     *
     * @param integer $sequenceIndex
     */
    public function setSequenceIndex($sequenceIndex)
    {
        $this->sequence_index = $sequenceIndex;
    }

    /**
     * Get sequence_index
     *
     * @return integer 
     */
    public function getSequenceIndex()
    {
        return $this->sequence_index;
    }

    /**
     * Set layers
     *
     * @param array $layers
     */
    public function setLayers($layers)
    {
        $this->layers = $layers;
    }

    /**
     * Get layers
     *
     * @return array 
     */
    public function getLayers()
    {
        return $this->layers;
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
     * Set thumb_url
     *
     * @param string $thumbUrl
     */
    public function setThumbUrl($thumbUrl)
    {
        $this->thumb_url = $thumbUrl;
    }

    /**
     * Get thumb_url
     *
     * @return string 
     */
    public function getThumbUrl()
    {
        return $this->thumb_url;
    }

    /**
     * Set sequence
     *
     * @param Zeega\DataBundle\Entity\Sequence $sequence
     */
    public function setSequence(\Zeega\DataBundle\Entity\Sequence $sequence)
    {
        $this->sequence = $sequence;
    }

    /**
     * Get sequence
     *
     * @return Zeega\DataBundle\Entity\Sequence 
     */
    public function getSequence()
    {
        return $this->sequence;
    }

    /**
     * Set link_up
     *
     * @param Zeega\DataBundle\Entity\Frame $linkUp
     */
    public function setLinkUp(\Zeega\DataBundle\Entity\Frame $linkUp)
    {
        $this->link_up = $linkUp;
    }

    /**
     * Get link_up
     *
     * @return Zeega\DataBundle\Entity\Frame 
     */
    public function getLinkUp()
    {
        return $this->link_up;
    }

    /**
     * Set link_down
     *
     * @param Zeega\DataBundle\Entity\Frame $linkDown
     */
    public function setLinkDown(\Zeega\DataBundle\Entity\Frame $linkDown)
    {
        $this->link_down = $linkDown;
    }

    /**
     * Get link_down
     *
     * @return Zeega\DataBundle\Entity\Frame 
     */
    public function getLinkDown()
    {
        return $this->link_down;
    }

    /**
     * Set link_left
     *
     * @param Zeega\DataBundle\Entity\Frame $linkLeft
     */
    public function setLinkLeft(\Zeega\DataBundle\Entity\Frame $linkLeft)
    {
        $this->link_left = $linkLeft;
    }

    /**
     * Get link_left
     *
     * @return Zeega\DataBundle\Entity\Frame 
     */
    public function getLinkLeft()
    {
        return $this->link_left;
    }

    /**
     * Set link_right
     *
     * @param Zeega\DataBundle\Entity\Frame $linkRight
     */
    public function setLinkRight(\Zeega\DataBundle\Entity\Frame $linkRight)
    {
        $this->link_right = $linkRight;
    }

    /**
     * Get link_right
     *
     * @return Zeega\DataBundle\Entity\Frame 
     */
    public function getLinkRight()
    {
        return $this->link_right;
    }
    /**
     * @var integer $sequence_id
     */
    private $sequence_id;

    /**
     * @var integer $project_id
     */
    private $project_id;

    /**
     * @var string $thumbnail_url
     */
    private $thumbnail_url;

    /**
     * @var boolean $enabled
     */
    private $enabled;

    /**
     * @var boolean $controllable
     */
    private $controllable;

    /**
     * @var Zeega\DataBundle\Entity\Project
     */
    private $project;


    /**
     * Set sequence_id
     *
     * @param integer $sequenceId
     * @return Frame
     */
    public function setSequenceId($sequenceId)
    {
        $this->sequence_id = $sequenceId;
    
        return $this;
    }

    /**
     * Get sequence_id
     *
     * @return integer 
     */
    public function getSequenceId()
    {
        return $this->sequence_id;
    }

    /**
     * Set project_id
     *
     * @param integer $projectId
     * @return Frame
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
     * Set thumbnail_url
     *
     * @param string $thumbnailUrl
     * @return Frame
     */
    public function setThumbnailUrl($thumbnailUrl)
    {
        $this->thumbnail_url = $thumbnailUrl;
    
        return $this;
    }

    /**
     * Get thumbnail_url
     *
     * @return string 
     */
    public function getThumbnailUrl()
    {
        return $this->thumbnail_url;
    }

    /**
     * Set enabled
     *
     * @param boolean $enabled
     * @return Frame
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
     * Set controllable
     *
     * @param boolean $controllable
     * @return Frame
     */
    public function setControllable($controllable)
    {
        $this->controllable = $controllable;
    
        return $this;
    }

    /**
     * Get controllable
     *
     * @return boolean 
     */
    public function getControllable()
    {
        return $this->controllable;
    }

    /**
     * Set project
     *
     * @param Zeega\DataBundle\Entity\Project $project
     * @return Frame
     */
    public function setProject(\Zeega\DataBundle\Entity\Project $project = null)
    {
        $this->project = $project;
    
        return $this;
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
}