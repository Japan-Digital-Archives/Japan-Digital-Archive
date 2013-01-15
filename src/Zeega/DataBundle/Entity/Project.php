<?php

namespace Zeega\DataBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Zeega\DataBundle\Entity\Project
 */
class Project
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
     * @var boolean $published
     */
    private $published;

    /**
     * @var datetime $created_at
     */
    private $created_at;

    /**
     * @var array $attr
     */
    private $attr;

    /**
     * @var Zeega\DataBundle\Entity\Site
     */
    private $site;

    /**
     * @var Zeega\DataBundle\Entity\User
     */
    private $users;

    public function __construct()
    {
        $this->users = new \Doctrine\Common\Collections\ArrayCollection();
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
     * Set published
     *
     * @param boolean $published
     */
    public function setPublished($published)
    {
        $this->published = $published;
    }

    /**
     * Get published
     *
     * @return boolean 
     */
    public function getPublished()
    {
        return $this->published;
    }

    /**
     * Set created_at
     *
     * @param datetime $createdAt
     */
    public function setCreatedAt($createdAt)
    {
        $this->created_at = $createdAt;
    }

    /**
     * Get created_at
     *
     * @return datetime 
     */
    public function getCreatedAt()
    {
        return $this->created_at;
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
     * Set site
     *
     * @param Zeega\DataBundle\Entity\Site $site
     */
    public function setSite(\Zeega\DataBundle\Entity\Site $site)
    {
        $this->site = $site;
    }

    /**
     * Get site
     *
     * @return Zeega\DataBundle\Entity\Site 
     */
    public function getSite()
    {
        return $this->site;
    }

    /**
     * Add users
     *
     * @param Zeega\DataBundle\Entity\User $users
     */
    public function addUser(\Zeega\DataBundle\Entity\User $users)
    {
        $this->users[] = $users;
    }

    /**
     * Get users
     *
     * @return Doctrine\Common\Collections\Collection 
     */
    public function getUsers()
    {
        return $this->users;
    }
    /**
     * @var string $item_id
     */
    private $item_id;

    /**
     * @var string $description
     */
    private $description;

    /**
     * @var string $location
     */
    private $location;

    /**
     * @var array $tags
     */
    private $tags;

    /**
     * @var boolean $enabled
     */
    private $enabled;

    /**
     * @var string $authors
     */
    private $authors;

    /**
     * @var string $cover_image
     */
    private $cover_image;

    /**
     * @var string $estimated_time
     */
    private $estimated_time;

    /**
     * @var \DateTime $date_created
     */
    private $date_created;

    /**
     * @var \DateTime $date_updated
     */
    private $date_updated;

    /**
     * @var \DateTime $date_published
     */
    private $date_published;


    /**
     * Set item_id
     *
     * @param string $itemId
     * @return Project
     */
    public function setItemId($itemId)
    {
        $this->item_id = $itemId;
    
        return $this;
    }

    /**
     * Get item_id
     *
     * @return string 
     */
    public function getItemId()
    {
        return $this->item_id;
    }

    /**
     * Set description
     *
     * @param string $description
     * @return Project
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
     * Set location
     *
     * @param string $location
     * @return Project
     */
    public function setLocation($location)
    {
        $this->location = $location;
    
        return $this;
    }

    /**
     * Get location
     *
     * @return string 
     */
    public function getLocation()
    {
        return $this->location;
    }

    /**
     * Set tags
     *
     * @param array $tags
     * @return Project
     */
    public function setTags($tags)
    {
        $this->tags = $tags;
    
        return $this;
    }

    /**
     * Get tags
     *
     * @return array 
     */
    public function getTags()
    {
        return $this->tags;
    }

    /**
     * Set enabled
     *
     * @param boolean $enabled
     * @return Project
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
     * Set authors
     *
     * @param string $authors
     * @return Project
     */
    public function setAuthors($authors)
    {
        $this->authors = $authors;
    
        return $this;
    }

    /**
     * Get authors
     *
     * @return string 
     */
    public function getAuthors()
    {
        return $this->authors;
    }

    /**
     * Set cover_image
     *
     * @param string $coverImage
     * @return Project
     */
    public function setCoverImage($coverImage)
    {
        $this->cover_image = $coverImage;
    
        return $this;
    }

    /**
     * Get cover_image
     *
     * @return string 
     */
    public function getCoverImage()
    {
        return $this->cover_image;
    }

    /**
     * Set estimated_time
     *
     * @param string $estimatedTime
     * @return Project
     */
    public function setEstimatedTime($estimatedTime)
    {
        $this->estimated_time = $estimatedTime;
    
        return $this;
    }

    /**
     * Get estimated_time
     *
     * @return string 
     */
    public function getEstimatedTime()
    {
        return $this->estimated_time;
    }

    /**
     * Set date_created
     *
     * @param \DateTime $dateCreated
     * @return Project
     */
    public function setDateCreated($dateCreated)
    {
        $this->date_created = $dateCreated;
    
        return $this;
    }

    /**
     * Get date_created
     *
     * @return \DateTime 
     */
    public function getDateCreated()
    {
        return $this->date_created;
    }

    /**
     * Set date_updated
     *
     * @param \DateTime $dateUpdated
     * @return Project
     */
    public function setDateUpdated($dateUpdated)
    {
        $this->date_updated = $dateUpdated;
    
        return $this;
    }

    /**
     * Get date_updated
     *
     * @return \DateTime 
     */
    public function getDateUpdated()
    {
        return $this->date_updated;
    }

    /**
     * Set date_published
     *
     * @param \DateTime $datePublished
     * @return Project
     */
    public function setDatePublished($datePublished)
    {
        $this->date_published = $datePublished;
    
        return $this;
    }

    /**
     * Get date_published
     *
     * @return \DateTime 
     */
    public function getDatePublished()
    {
        return $this->date_published;
    }

    /**
     * Remove users
     *
     * @param Zeega\DataBundle\Entity\User $users
     */
    public function removeUser(\Zeega\DataBundle\Entity\User $users)
    {
        $this->users->removeElement($users);
    }
}