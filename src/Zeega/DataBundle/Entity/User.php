<?php

namespace Zeega\DataBundle\Entity;

use FOS\UserBundle\Entity\User as BaseUser;
use Doctrine\ORM\Mapping as ORM;

/**
 * Zeega\DataBundle\Entity\User
 */
class User extends BaseUser

{
	   /**
     * Constructs a new instance of User
     */
    public function __construct()
    {
		parent::__construct();
        $this->created_at = new \DateTime();
    }

    /**
     * @var integer $id
     */
    protected $id;

    /**
     * @var string $display_name
     */
    protected $display_name;

    /**
     * @var text $bio
     */
    protected $bio ="";

    /**
     * @var string $thumb_url
     */
    protected $thumb_url = "http://mlhplayground.org/gamma-james/images/vertov.jpeg";

    /**
     * @var datetime $created_at
     */
    protected $created_at;
	

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
     * Set display_name
     *
     * @param string $displayName
     */
    public function setDisplayName($displayName)
    {
        $this->display_name = $displayName;
    }

    /**
     * Get display_name
     *
     * @return string 
     */
    public function getDisplayName()
    {
        return $this->display_name;
    }

    /**
     * Set bio
     *
     * @param text $bio
     */
    public function setBio($bio)
    {
        $this->bio = $bio;
    }

    /**
     * Get bio
     *
     * @return text 
     */
    public function getBio()
    {
        return $this->bio;
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
     * @var Zeega\DataBundle\Entity\Playground
     */
    public $sites;


    /**
     * Add playgrounds
     *
     * @param Zeega\DataBundle\Entity\Site $playgrounds
     */
    public function addSite(\Zeega\DataBundle\Entity\Site $sites)
    {
        $this->sites[] = $sites;
    }

    /**
     * Get playgrounds
     *
     * @return Doctrine\Common\Collections\Collection 
     */
    public function getSites()
    {
        return $this->sites;
    }
    /**
     * @var string $user_type
     */
    private $user_type;

    /**
     * @var string $location
     */
    private $location;

    /**
     * @var float $location_latitude
     */
    private $location_latitude;

    /**
     * @var float $location_longitude
     */
    private $location_longitude;

    /**
     * @var string $background_image_url
     */
    private $background_image_url;

    /**
     * @var string $dropbox_delta
     */
    private $dropbox_delta;

    /**
     * @var string $idea
     */
    private $idea;

    /**
     * @var string $api_key
     */
    private $api_key;


    /**
     * Set user_type
     *
     * @param string $userType
     * @return User
     */
    public function setUserType($userType)
    {
        $this->user_type = $userType;
    
        return $this;
    }

    /**
     * Get user_type
     *
     * @return string 
     */
    public function getUserType()
    {
        return $this->user_type;
    }

    /**
     * Set location
     *
     * @param string $location
     * @return User
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
     * Set location_latitude
     *
     * @param float $locationLatitude
     * @return User
     */
    public function setLocationLatitude($locationLatitude)
    {
        $this->location_latitude = $locationLatitude;
    
        return $this;
    }

    /**
     * Get location_latitude
     *
     * @return float 
     */
    public function getLocationLatitude()
    {
        return $this->location_latitude;
    }

    /**
     * Set location_longitude
     *
     * @param float $locationLongitude
     * @return User
     */
    public function setLocationLongitude($locationLongitude)
    {
        $this->location_longitude = $locationLongitude;
    
        return $this;
    }

    /**
     * Get location_longitude
     *
     * @return float 
     */
    public function getLocationLongitude()
    {
        return $this->location_longitude;
    }

    /**
     * Set background_image_url
     *
     * @param string $backgroundImageUrl
     * @return User
     */
    public function setBackgroundImageUrl($backgroundImageUrl)
    {
        $this->background_image_url = $backgroundImageUrl;
    
        return $this;
    }

    /**
     * Get background_image_url
     *
     * @return string 
     */
    public function getBackgroundImageUrl()
    {
        return $this->background_image_url;
    }

    /**
     * Set dropbox_delta
     *
     * @param string $dropboxDelta
     * @return User
     */
    public function setDropboxDelta($dropboxDelta)
    {
        $this->dropbox_delta = $dropboxDelta;
    
        return $this;
    }

    /**
     * Get dropbox_delta
     *
     * @return string 
     */
    public function getDropboxDelta()
    {
        return $this->dropbox_delta;
    }

    /**
     * Set idea
     *
     * @param string $idea
     * @return User
     */
    public function setIdea($idea)
    {
        $this->idea = $idea;
    
        return $this;
    }

    /**
     * Get idea
     *
     * @return string 
     */
    public function getIdea()
    {
        return $this->idea;
    }

    /**
     * Set api_key
     *
     * @param string $apiKey
     * @return User
     */
    public function setApiKey($apiKey)
    {
        $this->api_key = $apiKey;
    
        return $this;
    }

    /**
     * Get api_key
     *
     * @return string 
     */
    public function getApiKey()
    {
        return $this->api_key;
    }
}