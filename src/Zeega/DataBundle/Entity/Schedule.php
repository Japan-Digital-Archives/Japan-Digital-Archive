<?php

namespace Zeega\DataBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Schedule
 */
class Schedule
{
    /**
     * @var integer
     */
    private $id;

    /**
     * @var string
     */
    private $query;

    /**
     * @var string
     */
    private $tags;

    /**
     * @var string
     */
    private $archive;

    /**
     * @var \DateTime
     */
    private $date_created;

    /**
     * @var \DateTime
     */
    private $date_updated;

    /**
     * @var string
     */
    private $status;

    /**
     * @var string
     */
    private $status_message;

    /**
     * @var boolean
     */
    private $enabled;

    /**
     * @var \Zeega\DataBundle\Entity\User
     */
    private $user;


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
     * Set query
     *
     * @param string $query
     * @return Schedule
     */
    public function setQuery($query)
    {
        $this->query = $query;
    
        return $this;
    }

    /**
     * Get query
     *
     * @return string 
     */
    public function getQuery()
    {
        return $this->query;
    }

    /**
     * Set tags
     *
     * @param string $tags
     * @return Schedule
     */
    public function setTags($tags)
    {
        $this->tags = $tags;
    
        return $this;
    }

    /**
     * Get tags
     *
     * @return string 
     */
    public function getTags()
    {
        return $this->tags;
    }

    /**
     * Set archive
     *
     * @param string $archive
     * @return Schedule
     */
    public function setArchive($archive)
    {
        $this->archive = $archive;
    
        return $this;
    }

    /**
     * Get archive
     *
     * @return string 
     */
    public function getArchive()
    {
        return $this->archive;
    }

    /**
     * Set date_created
     *
     * @param \DateTime $dateCreated
     * @return Schedule
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
     * @return Schedule
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
     * Set status
     *
     * @param string $status
     * @return Schedule
     */
    public function setStatus($status)
    {
        $this->status = $status;
    
        return $this;
    }

    /**
     * Get status
     *
     * @return string 
     */
    public function getStatus()
    {
        return $this->status;
    }

    /**
     * Set status_message
     *
     * @param string $statusMessage
     * @return Schedule
     */
    public function setStatusMessage($statusMessage)
    {
        $this->status_message = $statusMessage;
    
        return $this;
    }

    /**
     * Get status_message
     *
     * @return string 
     */
    public function getStatusMessage()
    {
        return $this->status_message;
    }

    /**
     * Set enabled
     *
     * @param boolean $enabled
     * @return Schedule
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
     * Set user
     *
     * @param \Zeega\DataBundle\Entity\User $user
     * @return Schedule
     */
    public function setUser(\Zeega\DataBundle\Entity\User $user = null)
    {
        $this->user = $user;
    
        return $this;
    }

    /**
     * Get user
     *
     * @return \Zeega\DataBundle\Entity\User 
     */
    public function getUser()
    {
        return $this->user;
    }
}